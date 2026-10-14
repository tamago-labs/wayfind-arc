import { ethers } from "ethers";
import { createEthersAdapterFromProvider } from "@circle-fin/adapter-ethers-v6";
import { loadArcConfig, getCircleChainName, type ArcConfig } from "./config";
import tokens from "./data/arc-tokens.json";

export interface ArcToken {
  symbol: string;
  name: string;
  decimals: number;
  coingeckoId: string;
  addresses: {
    mainnet: string | null;
    testnet: string | null;
  };
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export class Agent {
  public walletAddress: string;
  public config: ArcConfig;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private tokens: ArcToken[];

  private constructor(config: ArcConfig, provider: ethers.JsonRpcProvider, signer: ethers.Wallet) {
    this.config = config;
    this.provider = provider;
    this.signer = signer;
    this.walletAddress = signer.address;
    this.tokens = tokens as ArcToken[];
  }

  static async create(): Promise<Agent> {
    const config = loadArcConfig();
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);
    return new Agent(config, provider, signer);
  }

  private getToken(symbol: string): ArcToken | undefined {
    return this.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
  }

  private getTokenAddress(symbol: string): string | null {
    const token = this.getToken(symbol);
    if (!token) return null;
    return this.config.chain === "testnet" ? token.addresses.testnet : token.addresses.mainnet;
  }

  private getAdapter() {
    return createEthersAdapterFromProvider({
      provider: this.signer as unknown as ethers.Eip1193Provider,
      capabilities: {},
    });
  }

  async getBalance(): Promise<any> {
    const result: any = {
      walletAddress: this.walletAddress,
      chain: this.config.chain,
      tokens: [],
    };

    for (const token of this.tokens) {
      const address = this.getTokenAddress(token.symbol);
      if (!address) continue;

      try {
        const contract = new ethers.Contract(address, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(this.walletAddress);
        const formatted = ethers.formatUnits(balance, token.decimals);
        (result.tokens as any[]).push({
          symbol: token.symbol,
          address,
          balance: formatted,
          decimals: token.decimals,
          isNative: token.symbol === "USDC",
        });
      } catch {
        // skip token if error
      }
    }

    return result;
  }

  getPriceSymbols(): string[] {
    return this.tokens.map((t) => t.symbol);
  }

  async sendTokens(symbol: string, to: string, amount: string): Promise<any> {
    const token = this.getToken(symbol);
    if (!token) throw new Error(`Unknown token: ${symbol}`);

    const address = this.getTokenAddress(symbol);
    if (!address) throw new Error(`Token ${symbol} not available on ${this.config.chain}`);

    const contract = new ethers.Contract(address, ERC20_ABI, this.signer);
    const parsedAmount = ethers.parseUnits(amount, token.decimals);
    const tx = await contract.transfer(to, parsedAmount);
    const receipt = await tx.wait();

    return {
      txHash: tx.hash,
      explorer: `${this.config.explorerUrl}/tx/${tx.hash}`,
      symbol,
      to,
      amount,
      blockNumber: receipt?.blockNumber,
    };
  }

  async depositUnifiedBalance(amount: string, symbol: string = "USDC"): Promise<any> {
    const adapter = this.getAdapter();
    const { createUnifiedBalanceKitContext, deposit } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();

    const result = await deposit(context, {
      from: { adapter, chain: getCircleChainName(this.config) },
      amount,
      tokenSymbol: symbol,
    });

    return result;
  }

  async spendUnifiedBalance(amount: string, recipient?: string, targetChain?: string, symbol: string = "USDC"): Promise<any> {
    const adapter = this.getAdapter();
    const { createUnifiedBalanceKitContext, spend } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();

    const params: any = {
      from: { adapter, chain: getCircleChainName(this.config) },
      amount,
      tokenSymbol: symbol,
    };
    if (recipient) params.recipient = recipient;
    if (targetChain) params.targetChain = targetChain;

    const result = await spend(context, params);
    return result;
  }

  async getPrices(symbols: string[]): Promise<any> {
    const ids = symbols
      .map((s) => {
        const token = this.getToken(s);
        return token?.coingeckoId;
      })
      .filter(Boolean)
      .join(",");

    if (!ids) return { error: "No valid symbols" };

    const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("ids", ids);
    url.searchParams.set("price_change_percentage", "24h,7d,30d");

    const res = await fetch(url.toString());
    const data = await res.json();

    const prices: Record<string, any> = {};
    for (const coin of data) {
      const symbol = this.tokens.find((t) => t.coingeckoId === coin.id)?.symbol || coin.symbol?.toUpperCase();
      prices[symbol] = {
        price: coin.current_price ?? 0,
        marketCap: coin.market_cap ?? 0,
        volume24h: coin.total_volume ?? 0,
        percentChange24h: coin.price_change_percentage_24h_in_currency ?? 0,
        percentChange7d: coin.price_change_percentage_7d_in_currency ?? 0,
        percentChange30d: coin.price_change_percentage_30d_in_currency ?? 0,
      };
    }

    return prices;
  }

  async swapTokens(fromSymbol: string, toSymbol: string, amount: string, slippagePercent: string = "0.5"): Promise<any> {
    const adapter = this.getAdapter();
    const { createSwapKitContext, swap } = await import("@circle-fin/swap-kit");
    const context = createSwapKitContext();

    const result = await swap(context, {
      from: { adapter, chain: getCircleChainName(this.config) },
      fromSymbol,
      toSymbol,
      amount,
      slippagePercent,
    });

    return result;
  }

  async earnDeposit(symbol: string, amount: string, vaultAddress?: string): Promise<any> {
    const adapter = this.getAdapter();
    const { createEarnKitContext, deposit } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();

    const params: any = {
      from: { adapter, chain: getCircleChainName(this.config) },
      amount,
      tokenSymbol: symbol,
    };
    if (vaultAddress) params.vaultAddress = vaultAddress;

    const result = await deposit(context, params);
    return result;
  }

  async earnWithdraw(symbol: string, amount: string, vaultAddress?: string): Promise<any> {
    const adapter = this.getAdapter();
    const { createEarnKitContext, withdraw } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();

    const params: any = {
      from: { adapter, chain: getCircleChainName(this.config), address: this.walletAddress },
      amount,
      tokenSymbol: symbol,
    };
    if (vaultAddress) params.vaultAddress = vaultAddress;

    const result = await withdraw(context, params);
    return result;
  }
}
