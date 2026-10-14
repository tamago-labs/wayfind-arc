#!/usr/bin/env node

// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// src/mcp/arc/get_wallet_address_tool.ts
var ArcGetWalletAddressTool = {
  name: "arc_get_wallet_address",
  description: "Get the Arc wallet address derived from the configured private key",
  schema: {},
  handler: async (agent, _input) => {
    return {
      walletAddress: agent.walletAddress,
      chain: agent.config.chain
    };
  }
};

// src/mcp/arc/get_balance_tool.ts
import { z } from "zod";
var ArcGetBalanceTool = {
  name: "arc_get_balance",
  description: "Get USDC and token balances for the Arc wallet. Optionally pass a symbol (e.g. 'USDC', 'cirBTC') to check a specific token.",
  schema: {
    symbol: z.string().optional().describe("Token symbol (e.g. 'USDC', 'WETH'). Omit for all tokens.")
  },
  handler: async (agent, input) => {
    return agent.getBalance(input?.symbol);
  }
};

// src/mcp/arc/send_tokens_tool.ts
import { z as z2 } from "zod";
var ArcSendTokensTool = {
  name: "arc_send_tokens",
  description: "Send tokens on Arc to a specific address. Symbol is resolved from token config (e.g. 'USDC', 'cirBTC', 'WETH').",
  schema: {
    symbol: z2.string().describe("Token symbol (e.g. 'USDC', 'WETH')"),
    to: z2.string().describe("Recipient address (0x...)"),
    amount: z2.string().describe("Amount to send (e.g. '100.5')")
  },
  handler: async (agent, input) => {
    return agent.sendTokens(input.symbol, input.to, input.amount);
  }
};

// src/mcp/arc/deposit_unified_tool.ts
import { z as z3 } from "zod";
var ArcDepositUnifiedBalanceTool = {
  name: "arc_deposit_unified_balance",
  description: "Deposit USDC into Circle Unified Balance on Arc. This makes the USDC available for cross-chain spending.",
  schema: {
    amount: z3.string().describe("Amount of USDC to deposit (e.g. '100.5')")
  },
  handler: async (agent, input) => {
    return agent.depositUnifiedBalance(input.amount);
  }
};

// src/mcp/arc/spend_unified_tool.ts
import { z as z4 } from "zod";
var ArcSpendUnifiedBalanceTool = {
  name: "arc_spend_unified_balance",
  description: "Spend/withdraw USDC from Circle Unified Balance. Can send to a different address and optionally bridge to another chain (e.g. 'Ethereum', 'Solana', 'Base').",
  schema: {
    amount: z4.string().describe("Amount of USDC to spend/withdraw"),
    recipient: z4.string().optional().describe("Recipient address (defaults to sender)"),
    targetChain: z4.string().optional().describe("Target chain for cross-chain transfer (e.g. 'Ethereum', 'Solana', 'Base', 'Arbitrum')")
  },
  handler: async (agent, input) => {
    return agent.spendUnifiedBalance(input.amount, input?.recipient, input?.targetChain);
  }
};

// src/mcp/arc/get_prices_tool.ts
import { z as z5 } from "zod";
var ArcGetPricesTool = {
  name: "arc_get_prices",
  description: "Get token prices from CoinGecko by symbol. Supports: USDC, EURC, cirBTC, WETH.",
  schema: {
    symbols: z5.array(z5.string()).describe("Array of token symbols (e.g. ['USDC', 'WETH', 'cirBTC'])")
  },
  handler: async (agent, input) => {
    return agent.getPrices(input.symbols);
  }
};

// src/mcp/arc/swap_tokens_tool.ts
import { z as z6 } from "zod";
var ArcSwapTokensTool = {
  name: "arc_swap_tokens",
  description: "Swap tokens on Arc via Circle Swap Kit. Symbol is resolved from token config (e.g. 'USDC', 'WETH', 'cirBTC').",
  schema: {
    fromSymbol: z6.string().describe("Token to swap from (e.g. 'WETH')"),
    toSymbol: z6.string().describe("Token to swap to (e.g. 'USDC')"),
    amount: z6.string().describe("Amount of from token to swap"),
    slippagePercent: z6.string().optional().describe("Slippage tolerance (default: '0.5')")
  },
  handler: async (agent, input) => {
    return agent.swapTokens(input.fromSymbol, input.toSymbol, input.amount, input?.slippagePercent);
  }
};

// src/mcp/arc/earn_deposit_tool.ts
import { z as z7 } from "zod";
var ArcEarnDepositTool = {
  name: "arc_earn_deposit",
  description: "Deposit tokens into a Circle Earn vault to earn yield. Symbol is resolved from token config.",
  schema: {
    symbol: z7.string().describe("Token symbol to deposit (e.g. 'USDC', 'WETH')"),
    amount: z7.string().describe("Amount to deposit"),
    vaultAddress: z7.string().optional().describe("Specific vault address (auto-selected if omitted)")
  },
  handler: async (agent, input) => {
    return agent.earnDeposit(input.symbol, input.amount, input?.vaultAddress);
  }
};

// src/mcp/arc/earn_withdraw_tool.ts
import { z as z8 } from "zod";
var ArcEarnWithdrawTool = {
  name: "arc_earn_withdraw",
  description: "Withdraw tokens from a Circle Earn vault. Symbol is resolved from token config.",
  schema: {
    symbol: z8.string().describe("Token symbol to withdraw (e.g. 'USDC', 'WETH')"),
    amount: z8.string().describe("Amount to withdraw"),
    vaultAddress: z8.string().optional().describe("Specific vault address (auto-selected if omitted)")
  },
  handler: async (agent, input) => {
    return agent.earnWithdraw(input.symbol, input.amount, input?.vaultAddress);
  }
};

// src/mcp/index.ts
var McpTools = {
  ArcGetWalletAddress: ArcGetWalletAddressTool,
  ArcGetBalance: ArcGetBalanceTool,
  ArcSendTokens: ArcSendTokensTool,
  ArcDepositUnifiedBalance: ArcDepositUnifiedBalanceTool,
  ArcSpendUnifiedBalance: ArcSpendUnifiedBalanceTool,
  ArcGetPrices: ArcGetPricesTool,
  ArcSwapTokens: ArcSwapTokensTool,
  ArcEarnDeposit: ArcEarnDepositTool,
  ArcEarnWithdraw: ArcEarnWithdrawTool
};

// src/agent.ts
import { ethers } from "ethers";
import { createEthersAdapterFromProvider } from "@circle-fin/adapter-ethers-v6";

// src/config.ts
var CHAIN_CONFIGS = {
  mainnet: {
    rpcUrl: "https://rpc.mainnet.arc.io",
    explorerUrl: "https://explorer.arc.io",
    chainId: 5042,
    circleChain: "Arc"
  },
  testnet: {
    rpcUrl: "https://rpc.testnet.arc.io",
    explorerUrl: "https://explorer.testnet.arc.io",
    chainId: 5042002,
    circleChain: "Arc_Testnet"
  }
};
function loadArcConfig() {
  const chain = process.env.ARC_CHAIN || "mainnet";
  const chainConfig = CHAIN_CONFIGS[chain];
  const privateKey = process.env.ARC_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ARC_PRIVATE_KEY environment variable is required");
  }
  return {
    chain,
    rpcUrl: process.env.ARC_RPC_URL || chainConfig.rpcUrl,
    explorerUrl: process.env.ARC_EXPLORER_URL || chainConfig.explorerUrl,
    chainId: chainConfig.chainId,
    privateKey
  };
}
function getCircleChainName(config) {
  return config.chain === "testnet" ? "Arc_Testnet" : "Arc";
}

// src/data/arc-tokens.json
var arc_tokens_default = [
  {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    coingeckoId: "usd-coin",
    addresses: {
      mainnet: "0x3600000000000000000000000000000000000000",
      testnet: "0x3600000000000000000000000000000000000000"
    }
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    coingeckoId: "euro-coin",
    addresses: {
      mainnet: "0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1",
      testnet: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a"
    }
  },
  {
    symbol: "cirBTC",
    name: "Circle Wrapped Bitcoin",
    decimals: 8,
    coingeckoId: "circle-wrapped-btc",
    addresses: {
      mainnet: "0x171A4217b86A807A64eB94757Db6849fb4bDbAA0",
      testnet: "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF"
    }
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    coingeckoId: "weth",
    addresses: {
      mainnet: "0x128cC466B61f542da60c70e3aA11c10e19B84EDB",
      testnet: null
    }
  }
];

// src/agent.ts
var ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];
var Agent = class _Agent {
  walletAddress;
  config;
  provider;
  signer;
  tokens;
  constructor(config, provider, signer) {
    this.config = config;
    this.provider = provider;
    this.signer = signer;
    this.walletAddress = signer.address;
    this.tokens = arc_tokens_default;
  }
  static async create() {
    const config = loadArcConfig();
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const signer = new ethers.Wallet(config.privateKey, provider);
    return new _Agent(config, provider, signer);
  }
  getToken(symbol) {
    return this.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
  }
  getTokenAddress(symbol) {
    const token = this.getToken(symbol);
    if (!token) return null;
    return this.config.chain === "testnet" ? token.addresses.testnet : token.addresses.mainnet;
  }
  getAdapter() {
    return createEthersAdapterFromProvider({
      provider: this.signer,
      capabilities: {}
    });
  }
  async getBalance(symbol) {
    const ethBalance = await this.provider.getBalance(this.walletAddress);
    const result = {
      walletAddress: this.walletAddress,
      nativeBalance: ethers.formatEther(ethBalance),
      chain: this.config.chain,
      tokens: []
    };
    const tokensToCheck = symbol ? this.tokens.filter((t) => t.symbol.toUpperCase() === symbol.toUpperCase()) : this.tokens;
    for (const token of tokensToCheck) {
      const address = this.getTokenAddress(token.symbol);
      if (!address) continue;
      try {
        const contract = new ethers.Contract(address, ERC20_ABI, this.provider);
        const balance = await contract.balanceOf(this.walletAddress);
        const formatted = ethers.formatUnits(balance, token.decimals);
        result.tokens.push({
          symbol: token.symbol,
          address,
          balance: formatted,
          decimals: token.decimals
        });
      } catch {
      }
    }
    return result;
  }
  async sendTokens(symbol, to, amount) {
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
      blockNumber: receipt?.blockNumber
    };
  }
  async depositUnifiedBalance(amount, symbol = "USDC") {
    const adapter = this.getAdapter();
    const { createUnifiedBalanceKitContext, deposit } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();
    const result = await deposit(context, {
      from: { adapter, chain: getCircleChainName(this.config) },
      amount,
      tokenSymbol: symbol
    });
    return result;
  }
  async spendUnifiedBalance(amount, recipient, targetChain, symbol = "USDC") {
    const adapter = this.getAdapter();
    const { createUnifiedBalanceKitContext, spend } = await import("@circle-fin/unified-balance-kit");
    const context = createUnifiedBalanceKitContext();
    const params = {
      from: { adapter, chain: getCircleChainName(this.config) },
      amount,
      tokenSymbol: symbol
    };
    if (recipient) params.recipient = recipient;
    if (targetChain) params.targetChain = targetChain;
    const result = await spend(context, params);
    return result;
  }
  async getPrices(symbols) {
    const ids = symbols.map((s) => {
      const token = this.getToken(s);
      return token?.coingeckoId;
    }).filter(Boolean).join(",");
    if (!ids) return { error: "No valid symbols" };
    const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("ids", ids);
    url.searchParams.set("price_change_percentage", "24h,7d,30d");
    const res = await fetch(url.toString());
    const data = await res.json();
    const prices = {};
    for (const coin of data) {
      const symbol = this.tokens.find((t) => t.coingeckoId === coin.id)?.symbol || coin.symbol?.toUpperCase();
      prices[symbol] = {
        price: coin.current_price ?? 0,
        marketCap: coin.market_cap ?? 0,
        volume24h: coin.total_volume ?? 0,
        percentChange24h: coin.price_change_percentage_24h_in_currency ?? 0,
        percentChange7d: coin.price_change_percentage_7d_in_currency ?? 0,
        percentChange30d: coin.price_change_percentage_30d_in_currency ?? 0
      };
    }
    return prices;
  }
  async swapTokens(fromSymbol, toSymbol, amount, slippagePercent = "0.5") {
    const adapter = this.getAdapter();
    const { createSwapKitContext, swap } = await import("@circle-fin/swap-kit");
    const context = createSwapKitContext();
    const result = await swap(context, {
      from: { adapter, chain: getCircleChainName(this.config) },
      fromSymbol,
      toSymbol,
      amount,
      slippagePercent
    });
    return result;
  }
  async earnDeposit(symbol, amount, vaultAddress) {
    const adapter = this.getAdapter();
    const { createEarnKitContext, deposit } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();
    const params = {
      from: { adapter, chain: getCircleChainName(this.config) },
      amount,
      tokenSymbol: symbol
    };
    if (vaultAddress) params.vaultAddress = vaultAddress;
    const result = await deposit(context, params);
    return result;
  }
  async earnWithdraw(symbol, amount, vaultAddress) {
    const adapter = this.getAdapter();
    const { createEarnKitContext, withdraw } = await import("@circle-fin/earn-kit");
    const context = createEarnKitContext();
    const params = {
      from: { adapter, chain: getCircleChainName(this.config), address: this.walletAddress },
      amount,
      tokenSymbol: symbol
    };
    if (vaultAddress) params.vaultAddress = vaultAddress;
    const result = await withdraw(context, params);
    return result;
  }
};

// src/index.ts
function createMcpServer(agent) {
  const server = new McpServer({
    name: "wayfind-arc-mcp",
    version: "0.1.0"
  });
  for (const [_key, tool] of Object.entries(McpTools)) {
    server.tool(tool.name, tool.description, tool.schema, async (params) => {
      try {
        const result = await tool.handler(agent, params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: error instanceof Error ? error.message : "Unknown error" }]
        };
      }
    });
  }
  return server;
}
async function main() {
  const agent = await Agent.create();
  const server = createMcpServer(agent);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main();
//# sourceMappingURL=index.mjs.map