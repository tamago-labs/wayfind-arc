# Arc Setup

## Prerequisites

- Node.js v22+

## Installation

### Global install

```bash
npm install -g @tamago-labs/wayfind-arc-mcp
```

### Local install (development)

```bash
cd mcp
npm install
npm run build
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WALLET_PASSKEY` | Yes | — | Passphrase (12+ chars) to auto-generate encrypted wallet |
| `ARC_CHAIN` | No | `mainnet` | Chain: `mainnet` or `testnet` |
| `ARC_RPC_URL` | No | Built-in | Custom Arc RPC endpoint |
| `ARC_EXPLORER_URL` | No | Built-in | Custom block explorer URL |

On first run, the server generates a BIP39 mnemonic wallet, encrypts it with `WALLET_PASSKEY`, and stores it in `~/.wayfind-arc/.wallet.json`. The mnemonic backup is written to `~/.wayfind-arc/BACKUP_AND_REMOVE.txt` — save it securely and delete the file.

## OpenCode Configuration

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
          "ARC_CHAIN": "mainnet"
        }
      }
    }
  }
}
```

## Claude Desktop Configuration

```json
{
  "mcpServers": {
    "wayfind-arc": {
      "command": "npx",
      "args": ["-y", "@tamago-labs/wayfind-arc-mcp"],
      "env": {
        "WALLET_PASSKEY": "your-secure-passphrase",
        "ARC_CHAIN": "mainnet"
      }
    }
  }
}
```

## Cursor Configuration

```json
{
  "mcp": {
    "servers": {
      "wayfind-arc": {
        "command": "npx",
        "args": ["-y", "@tamago-labs/wayfind-arc-mcp"],
        "env": {
          "WALLET_PASSKEY": "your-secure-passphrase",
          "ARC_CHAIN": "mainnet"
        }
      }
    }
  }
}
```

## Testnet Setup

For testnet, set `ARC_CHAIN=testnet` and get testnet tokens from [Circle Faucet](https://faucet.circle.com/):

1. Fund wallet with testnet USDC
2. Test deposits, swaps, and earn on testnet
3. Switch to mainnet for production

## Wallet Recovery

If the wallet file is lost, recover from the mnemonic backup:

```bash
WALLET_PASSKEY="your-passphrase" OVERWRITE_WALLET=1 npx tsx scripts/recover-wallet.ts "mnemonic words here"
```

## Verify Setup

After configuration, restart your MCP client and run:

```
arc_get_wallet_address
```

This should return your wallet address derived from the encrypted wallet.
