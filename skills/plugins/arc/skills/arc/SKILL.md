---
name: arc
description: >
  Use Arc for wallet operations, Circle Unified Balance (deposit/spend cross-chain), token swaps, and earn vault management on Arc chain.
  Provides wallet operations (balances, send tokens), unified balance (deposit, spend cross-chain, check balance),
  swaps (USDC, WETH, cirBTC), and earn vaults (list, deposit, check position, withdraw).
  Use this skill whenever the user mentions Arc, Circle Unified Balance, cross-chain transfers,
  earn vaults, token swaps on Arc, USDC on Arc, or Circle App Kits.
  Also invoke when the user wants to check balances, deposit to unified balance, swap tokens,
  manage earn positions, or send cross-chain transfers.
---

# Arc

Arc is an EVM-compatible L2 with USDC as the native gas token. This skill provides wallet operations, Circle Unified Balance (deposit/spend cross-chain), token swaps, and earn vault management via Circle App Kits.

## Arc platform overview

Arc uses USDC as its native gas token (not ETH). Circle App Kits provide:

- **Unified Balance** — Combine USDC from multiple chains into one spendable balance
- **Swap Kit** — Swap tokens on Arc via Circle's DEX aggregator
- **Earn Kit** — Deposit into earn vaults for yield (Morpho, etc.)

For full platform details, see [overview.md](references/overview.md).

## Setup

For installation, configuration, and environment variables, see [setup.md](references/setup.md).

Quick start:

```bash
npm install -g @tamago-labs/wayfind-arc-mcp
```

Set `WALLET_PASSKEY` (12+ chars) to auto-generate an encrypted wallet, and optionally `WAYFIND_NETWORK` (mainnet/testnet).

## Tool routing

Arc exposes 12 MCP tools. Route by user intent:

### Shared

| User intent | Tool |
|---|---|
| "What's my wallet address?" | `get_wallet_address` |
| "Show my balances" | `get_balances` |
| "Send X to address" | `send_tokens` |
| "Check transaction status" | `get_transaction` |

### Unified Balance & DeFi

| User intent | Tool |
|---|---|
| "Check my unified balance" | `get_unified_balance` |
| "Deposit X USDC to unified balance" | `deposit_unified_balance` |
| "Send X USDC to [chain]" | `spend_unified_balance` |
| "Swap X to Y" | `swap_tokens` |
| "Show earn vaults" | `list_earn_vaults` |
| "Deposit X to earn vault" | `earn_deposit` |
| "Check my earn position" | `get_earn_position` |
| "Withdraw X from earn vault" | `earn_withdraw` |

## Intent-based routing

**Balance check intent** ("check my balance", "show my wallet", "what do I have"):
- Use `get_balances` to get token balances for a specific chain

**Deposit intent** ("deposit to unified balance", "add to unified balance"):
1. Use `get_balances` to confirm available USDC
2. Use `deposit_unified_balance` with sourceChain and amount

**Cross-chain spend intent** ("send to Ethereum", "bridge to Base"):
1. Use `get_unified_balance` to check available balance
2. Use `spend_unified_balance` with sourceChain, amount, and targetChain

**Swap intent** ("swap X to Y", "trade X for Y"):
1. Use `swap_tokens` with chain, fromSymbol, toSymbol, amount

**Earn intent** ("earn yield", "deposit to vault", "show vaults"):
1. Use `list_earn_vaults` to show available vaults with APY
2. Use `earn_deposit` to deposit to the chosen vault
3. Use `get_earn_position` to check balance and yield
4. Use `earn_withdraw` to withdraw

## Execution rules

1. For deposits, always check `get_balances` first to confirm funds
2. For cross-chain spends, always specify sourceChain and targetChain
3. For earn deposits, always list vaults first with `list_earn_vaults` to show APY
4. For earn withdrawals, check position first with `get_earn_position`
5. Token symbols: USDC, WETH, cirBTC, EURC (resolved from built-in config per chain)
6. Cross-chain transfers burn USDC on source chain and mint on destination chain via Circle Gateway

## Response format

For all operational responses, return:
1. What was done (action and scope)
2. The result (balances, tx hash, chain breakdown, etc.)
3. What to do next (or confirmation that the task is complete)

Keep output concise. Include explorer URLs for transactions.
