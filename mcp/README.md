# Wayfind Arc MCP

![NPM Version](https://img.shields.io/npm/v/@tamago-labs/wayfind-arc-mcp)

**Wayfind Arc MCP** is a Model Context Protocol (MCP) server for the Arc chain ecosystem. It provides wallet operations, Circle Unified Balance (deposit/spend cross-chain), token swaps, and earn vault management via Circle App Kits — across Arc, Ethereum, Base, and more.

## Features

- **12 MCP tools** covering wallet management, unified balance, swaps, and earn
- **Encrypted BIP39 wallet** — auto-generated on first run, encrypted with `WALLET_PASSKEY`
- **Multi-chain balances** — query tokens across all supported chains in one call
- **Circle Unified Balance** — deposit USDC, spend/withdraw cross-chain to 12+ chains
- **Cross-chain transfers** — spend USDC from Arc to Ethereum, Base, Arbitrum, and more
- **Token swaps** — swap USDC, WETH, cirBTC via Circle Swap Kit
- **Earn vaults** — list vaults, deposit, withdraw, check position with yield
- **Transaction lookup** — get tx details and status on any supported chain

## Installation

```bash
npm install -g @tamago-labs/wayfind-arc-mcp
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WALLET_PASSKEY` | Yes | — | Passphrase (12+ chars) to auto-generate encrypted wallet |
| `WAYFIND_NETWORK` | No | `testnet` | Network mode: `testnet` or `mainnet` |

On first run, the server generates a BIP39 mnemonic wallet, encrypts it with `WALLET_PASSKEY`, and stores it in `~/.wayfind-arc/.wallet.json`. The mnemonic backup is written to `~/.wayfind-arc/BACKUP_AND_REMOVE.txt` — save it securely and delete the file.

### Wallet Recovery

```bash
WALLET_PASSKEY="your-passphrase" OVERWRITE_WALLET=1 npx tsx scripts/recover-wallet.ts "mnemonic words"
```

### OpenCode

Add to `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "wayfind-arc": {
        "type": "local",
        "command": ["npx", "-y", "@tamago-labs/wayfind-arc-mcp"],
        "environment": {
          "WALLET_PASSKEY": "your-secure-passphrase",
          "WAYFIND_NETWORK": "mainnet"
        }
      }
    }
  }
}
```

### Claude Desktop

```json
{
  "mcpServers": {
    "wayfind-arc": {
      "command": "npx",
      "args": ["-y", "@tamago-labs/wayfind-arc-mcp"],
      "env": {
        "WALLET_PASSKEY": "your-secure-passphrase",
        "WAYFIND_NETWORK": "mainnet"
      }
    }
  }
}
```

### Cursor

```json
{
  "mcp": {
    "servers": {
      "wayfind-arc": {
        "command": "npx",
        "args": ["-y", "@tamago-labs/wayfind-arc-mcp"],
        "env": {
          "WALLET_PASSKEY": "your-secure-passphrase",
          "WAYFIND_NETWORK": "mainnet"
        }
      }
    }
  }
}
```

## Available Tools

### Shared (Chain-Agnostic)

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_wallet_address` | Get wallet addresses for all supported chains | — |
| `get_balances` | Get token balances for a specific chain | `chain` |
| `send_tokens` | Send tokens on a specific chain | `chain`, `token`, `amount`, `recipient` |
| `get_transaction` | Get tx details and status | `chain`, `txHash` |

### Circle Unified Balance & DeFi

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_unified_balance` | Check total USDC and chain breakdown | — |
| `deposit_unified_balance` | Deposit USDC into Unified Balance | `sourceChain`, `amount` |
| `spend_unified_balance` | Spend/withdraw USDC, optionally cross-chain | `sourceChain`, `amount`, `recipient?`, `targetChain?` |
| `swap_tokens` | Swap tokens via Circle Swap Kit | `chain`, `fromSymbol`, `toSymbol`, `amount`, `slippagePercent?` |
| `list_earn_vaults` | List earn vaults sorted by APY | `chain`, `symbol?` |
| `get_earn_position` | Check vault position (balance, yield) | `chain`, `vaultAddress` |
| `earn_deposit` | Deposit into an earn vault | `chain`, `vaultAddress`, `amount` |
| `earn_withdraw` | Withdraw from an earn vault | `chain`, `vaultAddress`, `amount` |

## Supported Chains

Testnet: Arc, Ethereum (Sepolia), Base (Sepolia)
Mainnet: Arc, Ethereum, Base, Arbitrum, Polygon, Avalanche, Optimism, World Chain, Sei

## Architecture

```
mcp/
├── package.json                # @tamago-labs/wayfind-arc-mcp
├── tsconfig.json
├── tsup.config.ts              # Build: CJS + ESM + .d.ts
├── README.md
└── src/
    ├── index.ts                # MCP server bootstrap
    ├── config.ts               # Chain configs, wallet generation, encryption
    ├── types.ts                # McpTool interface
    ├── agent.ts                # Agent class: wallet, adapter, SDK methods
    ├── data/
    │   └── chains/             # Per-chain token configs
    │       ├── arc-mainnet.json
    │       ├── arc-testnet.json
    │       ├── ethereum-mainnet.json
    │       ├── ethereum-testnet.json
    │       ├── base-mainnet.json
    │       ├── base-testnet.json
    │       └── ...
    └── mcp/
        ├── index.ts            # Tool registry
        ├── shared/             # Chain-agnostic tools
        │   ├── get_wallet_address_tool.ts
        │   ├── get_balances_tool.ts
        │   ├── send_tokens_tool.ts
        │   └── get_transaction_tool.ts
        └── circle/             # Circle Unified Balance & DeFi
            ├── get_unified_balance_tool.ts
            ├── deposit_unified_tool.ts
            ├── spend_unified_tool.ts
            ├── swap_tokens_tool.ts
            ├── list_earn_vaults_tool.ts
            ├── get_earn_position_tool.ts
            ├── earn_deposit_tool.ts
            └── earn_withdraw_tool.ts
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.10.2 | MCP server + StdioServerTransport |
| `@circle-fin/adapter-ethers-v6` | ^1.0.0 | Ethers adapter for Circle SDKs |
| `@circle-fin/unified-balance-kit` | ^1.0.0 | Unified Balance deposit/spend |
| `@circle-fin/swap-kit` | ^1.0.0 | Token swaps |
| `@circle-fin/earn-kit` | ^1.0.0 | Earn vault operations |
| `ethers` | ^6.13.0 | EVM wallet and contract interaction |
| `bip39` | ^3.1.0 | BIP39 mnemonic wallet generation |
| `sodium-native` | ^4.1.0 | Encrypted wallet storage |
| `zod` | ^3.24.3 | Tool parameter schemas |

## Building

```bash
cd mcp
npm install
npm run build      # Outputs to dist/
npm start          # Run the server
```

## License

MIT
