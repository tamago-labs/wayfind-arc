import type { McpTool } from "../types";

import { GetWalletAddressTool } from "./shared/get_wallet_address_tool";
import { GetBalancesTool } from "./shared/get_balances_tool";
import { SendTokensTool } from "./shared/send_tokens_tool";
import { GetTransactionTool } from "./shared/get_transaction_tool";
import { GetUnifiedBalanceTool } from "./circle/get_unified_balance_tool";
import { DepositUnifiedBalanceTool } from "./circle/deposit_unified_tool";
import { SpendUnifiedBalanceTool } from "./circle/spend_unified_tool";
import { SwapTokensTool } from "./circle/swap_tokens_tool";
import { ListEarnVaultsTool } from "./circle/list_earn_vaults_tool";
import { GetEarnPositionTool } from "./circle/get_earn_position_tool";
import { EarnDepositTool } from "./circle/earn_deposit_tool";
import { EarnWithdrawTool } from "./circle/earn_withdraw_tool";

export const McpTools: Record<string, McpTool> = {
  GetWalletAddress: GetWalletAddressTool,
  GetBalances: GetBalancesTool,
  SendTokens: SendTokensTool,
  GetTransaction: GetTransactionTool,
  GetUnifiedBalance: GetUnifiedBalanceTool,
  DepositUnifiedBalance: DepositUnifiedBalanceTool,
  SpendUnifiedBalance: SpendUnifiedBalanceTool,
  SwapTokens: SwapTokensTool,
  ListEarnVaults: ListEarnVaultsTool,
  GetEarnPosition: GetEarnPositionTool,
  EarnDeposit: EarnDepositTool,
  EarnWithdraw: EarnWithdrawTool,
};
