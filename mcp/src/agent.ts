import { ethers } from "ethers";
import { createEthersAdapterFromPrivateKey } from "@circle-fin/adapter-ethers-v6";
import { loadArcConfig, toCircleChain, getChainConfig, getSupportedChains, type ArcConfig, type ChainConfig } from "./config";

export interface ArcToken {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const RPC_MAP: Record<string, Record<string, string>> = {
  arc: { mainnet: "https://rpc.mainnet.arc.io", testnet: "https://rpc.testnet.arc.io" },
  ethereum: { mainnet: "https://eth.llamarpc.com", testnet: "https://ethereum-sepolia-rpc.publicnode.com" },
  base: { mainnet: "https://mainnet.base.org", testnet: "https://sepolia.base.org" },
  arbitrum: { mainnet: "https://arb1.arbitrum.io/rpc", testnet: "https://arbitrum-sepolia-rpc.publicnode.com" },
  optimism: { mainnet: "https://mainnet.optimism.io", testnet: "https://optimism-sepolia-rpc.publicnode.com" },
  polygon: { mainnet: "https://polygon-rpc.com", testnet: "https://polygon-amoy-rpc.publicnode.com" },
  avalanche: { mainnet: "https://avalanche-c-chain-rpc.publicnode.com", testnet: "https://avalanche-fuji-rpc.publicnode.com" },
  world: { mainnet: "https://worldchain-mainnet.gateway.tenderly.co", testnet: "https://worldchain-sepolia.gateway.tenderly.co" },
  sei: { mainnet: "https://evm-rpc.sei-apis.com", testnet: "https://evm-rpc-testnet.sei-apis.com" },
};

const EXPLORER_MAP: Record<string, Record<string, string>> = {
  arc: { mainnet: "https://explorer.arc.io", testnet: "https://explorer.testnet.arc.io" },
  ethereum: { mainnet: "https://etherscan.io", testnet: "https://sepolia.etherscan.io" },
  base: { mainnet: "https://basescan.org", testnet: "https://sepolia.basescan.org" },
  arbitrum: { mainnet: "https://arbiscan.io", testnet: "https://sepolia.arbiscan.io" },
  optimism: { mainnet: "https://optimistic.etherscan.io", testnet: "https://sepolia-optimism.etherscan.io" },
  polygon: { mainnet: "https://polygonscan.com", testnet: "https://amoy.polygonscan.com" },
  avalanche: { mainnet: "https://snowtrace.io", testnet: "https://testnet.snowtrace.io" },
  world: { mainnet: "https://worldchain.blockscout.com", testnet: "https://worldchain-sepolia.blockscout.com" },
  sei: { mainnet: "https://seitrace.com", testnet: "https://seitrace.com" },
};

function getRpcUrl(chain: string, network: string): string {
  return RPC_MAP[chain]?.[network] || "https://rpc.mainnet.arc.io";
}

function getExplorerUrl(chain: string, network: string): string {
  return EXPLORER_MAP[chain]?.[network] || "https://explorer.arc.io";
}

function getChainTokens(chain: string, network: string): ArcToken[] {
  const cfg = getChainConfig(chain, network);
  return (cfg?.tokens || []).map((t) => ({
    symbol: t.symbol,
    name: t.name,
    decimals: t.decimals,
    address: t.address,
  }));
}

export class Agent {
  public walletAddress: string;
  public config: ArcConfig;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  private constructor(config: ArcConfig, provider: ethers.JsonRpcProvider, signer: ethers.Wallet) {
    this.config = config;
    this.provider = provider;
    this.signer = signer;
    this.walletAddress = config.walletAddress;
  }

  static async create(): Promise<Agent> {
    const config = await loadArcConfig();
    const rpcUrl = getRpcUrl("arc", config.network);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);
    return new Agent(config, provider, signer);
  }

  private async getAdapter() {
    return createEthersAdapterFromPrivateKey({
      privateKey: this.config.privateKey,
    });
  }

  async getTransaction(chain: string, txHash: string): Promise<any> {
    const network = this.config.network;
    const rpcUrl = getRpcUrl(chain, network);

    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);

      if (!receipt) {
        return {
          chain,
          txHash,
          status: "pending",
          from: tx?.from || "unknown",
          to: tx?.to || "unknown",
          explorer: getExplorerUrl(chain, network),
        };
      }

      return {
        chain,
        txHash,
        status: receipt.status === 1 ? "confirmed" : "failed",
        blockNumber: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to,
        value: tx?.value ? ethers.formatUnits(tx.value, 18) : "0",
        gasUsed: receipt.gasUsed?.toString(),
        explorer: getExplorerUrl(chain, network),
      };
    } catch (err: any) {
      return { error: err?.message || "Failed to fetch transaction" };
    }
  }

  async getBalance(chain?: string): Promise<any> {
    const network = this.config.network;
    const targetChains = chain ? [chain] : getSupportedChains(network);

    const result: any = {
      walletAddress: this.walletAddress,
      network,
      chains: {},
    };

    for (const chainName of targetChains) {
      const tokens = getChainTokens(chainName, network);
      const rpcUrl = getRpcUrl(chainName, network);
      const provider = new ethers.JsonRpcProvider(rpcUrl);

      const chainBalances: any[] = [];
      for (const token of tokens) {
        try {
          if (!token.address) continue;
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
          const balance = await contract.balanceOf(this.walletAddress);
          chainBalances.push({
            symbol: token.symbol,
            address: token.address,
            balance: ethers.formatUnits(balance, token.decimals),
            decimals: token.decimals,
          });
        } catch {
          // skip token if error
        }
      }

      const chainResult: any = {
        chainId: getChainConfig(chainName, network)?.chainId,
        tokens: chainBalances,
      };

      if (chainName !== "arc") {
        const nativeBalance = await provider.getBalance(this.walletAddress);
        const decimals = getChainConfig(chainName, network)?.nativeCurrency?.decimals || 18;
        chainResult.native = {
          symbol: getChainConfig(chainName, network)?.nativeCurrency?.symbol || "ETH",
          balance: ethers.formatUnits(nativeBalance, decimals),
        };
      }

      result.chains[chainName] = chainResult;
    }

    return result;
  }

  async getUnifiedBalance(): Promise<any> {
    const adapter = await this.getAdapter();
    const { createUnifiedBalanceKitContext, getBalances } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();

    const result = await getBalances(context, {
      sources: [{ adapter }],
      networkType: this.config.network,
      includePending: true,
    });

    return result;
  }

  async sendTokens(chain: string, symbol: string, to: string, amount: string): Promise<any> {
    const token = getChainTokens(chain, this.config.network).find(
      (t) => t.symbol.toUpperCase() === symbol.toUpperCase()
    );
    if (!token) throw new Error(`Unknown token: ${symbol} on chain ${chain}`);
    if (!token.address) throw new Error(`Token ${symbol} has no address on ${chain}`);

    const rpcUrl = getRpcUrl(chain, this.config.network);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(this.config.privateKey, provider);

    const contract = new ethers.Contract(token.address, ERC20_ABI, signer);
    const parsedAmount = ethers.parseUnits(amount, token.decimals);
    const tx = await contract.transfer(to, parsedAmount);
    const receipt = await tx.wait();

    return {
      txHash: tx.hash,
      explorer: `${getExplorerUrl(chain, this.config.network)}/tx/${tx.hash}`,
      chain,
      symbol,
      to,
      amount,
      blockNumber: receipt?.blockNumber,
    };
  }

  async getSupportedChains(): Promise<any> {
    const balance = await this.getUnifiedBalance();
    const chains: Array<{ chain: string; confirmed: string; pending: string }> = [];
    if (balance.breakdown) {
      for (const group of balance.breakdown) {
        if (group.breakdown) {
          for (const item of group.breakdown) {
            chains.push({
              chain: item.chain,
              confirmed: item.confirmedBalance ?? "0",
              pending: item.pendingBalance ?? "0",
            });
          }
        }
      }
    }
    return {
      token: balance.token,
      totalConfirmed: balance.totalConfirmedBalance ?? "0",
      totalPending: balance.totalPendingBalance ?? "0",
      chains,
    };
  }

  async depositUnifiedBalance(chain: string, amount: string): Promise<any> {
    const adapter = await this.getAdapter();
    const { createUnifiedBalanceKitContext, deposit } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();

    const result = await deposit(context, {
      from: { adapter, chain: toCircleChain(chain) },
      amount,
      token: "USDC",
    });

    return result;
  }

  async spendUnifiedBalance(chain: string, amount: string, recipient?: string, targetChain?: string): Promise<any> {
    const adapter = await this.getAdapter();
    const { createUnifiedBalanceKitContext, spend } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();

    const to: any = {
      adapter,
      chain: toCircleChain(chain),
    };
    if (recipient) to.recipientAddress = recipient;

    const params: any = {
      amount,
      token: "USDC",
      from: [{ adapter }],
      to,
    };
    if (targetChain) to.chain = toCircleChain(targetChain);

    const result = await spend(context, params);
    return result;
  }

  getPriceSymbols(chain?: string): string[] {
    if (chain) {
      return getChainTokens(chain, this.config.network).map((t) => t.symbol);
    }
    const allTokens = new Set<string>();
    for (const c of getSupportedChains(this.config.network)) {
      for (const t of getChainTokens(c, this.config.network)) {
        allTokens.add(t.symbol);
      }
    }
    return Array.from(allTokens);
  }

  async getPrices(chain?: string): Promise<any> {
    const symbols = this.getPriceSymbols(chain);
    const ids = symbols.map((s) => s.toLowerCase()).join(",");

    if (!ids) return { error: "No valid symbols" };

    const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("ids", ids);
    url.searchParams.set("price_change_percentage", "24h,7d,30d");

    const res = await fetch(url.toString());
    const data = await res.json();

    const prices: Record<string, any> = {};
    for (const coin of data) {
      const symbol = coin.symbol?.toUpperCase() || coin.id;
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

  async listEarnVaults(chain: string, symbol?: string): Promise<any> {
    const { createEarnKitContext, exploreVaults } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();

    const result = await exploreVaults(context, {
      chain: toCircleChain(chain),
      sortBy: "apy",
    });

    const vaults = (result.vaults || []).map((v: any) => ({
      vaultAddress: v.vaultAddress,
      name: v.name,
      protocol: v.protocol,
      asset: v.asset,
      currentApy: v.currentApy ?? 0,
      status: v.status,
      totalDeposits: v.totalDeposits ?? "0",
      liquidity: v.liquidity ?? "0",
    }));

    if (symbol) {
      return vaults.filter((v: any) => v.asset.toLowerCase() === symbol.toLowerCase());
    }
    return vaults;
  }

  async getEarnPosition(chain: string, vaultAddress: string): Promise<any> {
    const adapter = await this.getAdapter();
    const { createEarnKitContext, getPosition } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();

    const pos = await getPosition(context, {
      from: { adapter, chain: toCircleChain(chain) },
      vaultAddress,
    });

    if (!pos) return null;

    return {
      vaultAddress,
      currentBalance: pos.currentBalance ?? "0",
      shares: pos.shares ?? "0",
      principalDeposited: pos.pnl?.status === "available" ? pos.pnl.principalDeposited : "0",
      totalYieldEarned: pos.pnl?.status === "available" ? pos.pnl.totalYieldEarned : "0",
    };
  }

  async swapTokens(chain: string, fromSymbol: string, toSymbol: string, amount: string, slippagePercent: string = "0.5"): Promise<any> {
    const adapter = await this.getAdapter();
    const { createSwapKitContext, swap } = await import("@circle-fin/swap-kit");
    const context = createSwapKitContext();

    const result = await swap(context, {
      from: { adapter, chain: toCircleChain(chain) },
      fromSymbol,
      toSymbol,
      amount,
      slippagePercent,
    });

    return result;
  }

  async earnDeposit(chain: string, amount: string, vaultAddress: string): Promise<any> {
    const adapter = await this.getAdapter();
    const { createEarnKitContext, deposit } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();

    const result = await deposit(context, {
      from: { adapter, chain: toCircleChain(chain) },
      vaultAddress,
      amount,
    });

    return result;
  }

  async earnWithdraw(chain: string, amount: string, vaultAddress: string): Promise<any> {
    const adapter = await this.getAdapter();
    const { createEarnKitContext, withdraw } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();

    const result = await withdraw(context, {
      from: { adapter, chain: toCircleChain(chain), address: this.walletAddress },
      vaultAddress,
      amount,
    });

    return result;
  }
}
