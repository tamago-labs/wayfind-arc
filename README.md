# Wayfind Arc

[![Frontend](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)](https://github.com/tamago-labs/wayfind-arc)
[![MCP](https://img.shields.io/badge/MCP-Server-blue)](https://www.npmjs.com/package/@tamago-labs/wayfind-arc-mcp)

**Turn Grok Bot into a 24/7 onchain operator for Arc chain.**

## Overview

Grok Bot launched in September 2026 as your team of always-on AI teammates. Each bot has its **own dedicated computer**, uses it like you do, and never logs off. This means you can run a bot 24/7 without renting a separate host while still accessing Grok AI services.

But Grok Bot can't interact with blockchains out of the box. **Wayfind Arc** bridges that gap. It combines an MCP server, agent skills, and a web dashboard so your Grok Bot can:

- Manage Arc wallets — check balances, send tokens
- Move USDC across 12+ chains via Circle Unified Balance
- Swap tokens (USDC, WETH, cirBTC) via Circle Swap Kit
- Earn yield through earn vaults (Morpho, etc.)
- Operate autonomously, 24/7, on the bot's dedicated computer

No separate hosting. No manual intervention. Your bot has its own wallet, its own tools, and its own memory.

## What's Inside

| Package | Description |
|---------|-------------|
| `frontend/` | Next.js dashboard — wallet connect, explore, portfolio, unified balance |
| `mcp/` | MCP server — 13 tools for wallet, swaps, unified balance, earn |
| `skills/` | Agent skills plugin — Claude, Cursor, Grok Bot manifests + intent routing |

## Quick Start

### Dashboard

```bash
cd frontend
npm install
npm run dev
```

### MCP Server (local)

```bash
cd mcp
npm install
npm run build
ARC_PRIVATE_KEY=0x... ARC_CHAIN=mainnet npm start
```

### Install on Grok Bot

Add the MCP server to your Grok Bot environment:

```
ARC_PRIVATE_KEY=0x...
ARC_CHAIN=mainnet
```

Then ask your bot: *"Set up Wayfind Arc"* — it will install the tools and guide you through wallet setup.

### Install on Other Clients

**OpenCode** (`~/.config/opencode/opencode.jsonc`):

```jsonc
{
  "mcp": {
    "servers": {
      "wayfind-arc": {
        "type": "local",
        "command": ["npx", "-y", "@tamago-labs/wayfind-arc-mcp"],
        "environment": {
          "ARC_PRIVATE_KEY": "your_key_here",
          "ARC_CHAIN": "mainnet"
        }
      }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "wayfind-arc": {
      "command": "npx",
      "args": ["-y", "@tamago-labs/wayfind-arc-mcp"],
      "env": {
        "ARC_PRIVATE_KEY": "your_key_here",
        "ARC_CHAIN": "mainnet"
      }
    }
  }
}
```

## MCP Tools

### Wallet

| Tool | Description |
|------|-------------|
| `arc_get_wallet_address` | Get wallet address from private key |
| `arc_get_balance` | Get all token balances (USDC, WETH, cirBTC) |
| `arc_send_tokens` | Send tokens by symbol to an address |

### Unified Balance

| Tool | Description |
|------|-------------|
| `arc_get_unified_balance` | Check total USDC and chain breakdown |
| `arc_get_supported_chains` | List chains available for cross-chain transfers |
| `arc_deposit_unified_balance` | Deposit USDC into Unified Balance |
| `arc_spend_unified_balance` | Withdraw/spend USDC, optionally cross-chain |

### Swap & Earn

| Tool | Description |
|------|-------------|
| `arc_swap_tokens` | Swap tokens via Circle Swap Kit |
| `arc_list_earn_vaults` | List available earn vaults with APY |
| `arc_earn_deposit` | Deposit into an earn vault |
| `arc_get_earn_position` | Check position (balance, shares, yield) |
| `arc_earn_withdraw` | Withdraw from an earn vault |

### Prices

| Tool | Description |
|------|-------------|
| `arc_get_prices` | Get all token prices from CoinGecko |

## Supported Tokens

| Symbol | Decimals | CoinGecko |
|--------|----------|-----------|
| USDC | 6 | usd-coin |
| EURC | 6 | euro-coin |
| cirBTC | 8 | circle-wrapped-btc |
| WETH | 18 | weth |

Configured for both Arc Mainnet and Testnet.

## Architecture

```
wayfind-arc/
├── frontend/                 # Next.js web dashboard
│   └── app/
│       ├── dashboard/        # Portfolio, explore, token detail
│       ├── api/              # Backend API routes
│       ├── contexts/         # Web3 contexts (wallet, prices, earn)
│       └── components/       # UI components
├── mcp/                      # MCP server package
│   └── src/
│       ├── agent.ts          # Agent class: wallet, adapter, SDK methods
│       ├── config.ts         # Chain config (mainnet/testnet)
│       ├── data/             # Token config (symbols, addresses)
│       └── mcp/arc/          # 13 MCP tool definitions
└── skills/                   # Agent skills plugin
    └── plugins/arc/
        ├── .claude-plugin/   # Claude Code manifest
        ├── .cursor-plugin/   # Cursor manifest + MCP config
        ├── .grok-plugin/     # Grok Bot manifest + MCP config
        └── skills/arc/       # SKILL.md + references
```

## License

MIT

© 2026 Tamago Labs
