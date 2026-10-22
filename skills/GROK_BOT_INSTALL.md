# Arc — Grok Bot Install

Install the Arc MCP server on your Grok Bot.

## Install

1. Open your Grok Bot dashboard
2. Go to **Plugins** → **Install from GitHub**
3. Enter: `tamago-labs/wayfind-arc`
4. Select the `skills` directory as the plugin root

## Configure

After install, set these environment variables in your Bot settings:

| Variable | Value |
|----------|-------|
| `WALLET_PASSKEY` | A secure passphrase (12+ chars) |
| `ARC_CHAIN` | `mainnet` or `testnet` |

On first run, the server generates a BIP39 mnemonic wallet, encrypts it with your passphrase, and stores it in `~/.wayfind-arc/.wallet.json`. The mnemonic backup is written to `~/.wayfind-arc/BACKUP_AND_REMOVE.txt` — **save it securely and delete the file**.

### Wallet Recovery

If the wallet file is lost, run:

```
WALLET_PASSKEY="your-passphrase" OVERWRITE_WALLET=1 npx tsx scripts/recover-wallet.ts "your mnemonic words"
```

## Verify

Ask your Bot: "What's my wallet address?"

The Bot should respond with your Arc wallet address.

## Testnet

For testing, set `ARC_CHAIN=testnet` and get tokens from [Circle Faucet](https://faucet.circle.com/).
