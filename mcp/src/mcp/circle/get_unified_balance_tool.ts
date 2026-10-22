import { z } from "zod";
import { Agent } from "../../agent";
import type { McpTool } from "../../types";

export const GetUnifiedBalanceTool: McpTool = {
  name: "get_unified_balance",
  description: "Get Circle Unified Balance. Shows total USDC balance and breakdown by network.",
  schema: {},
  handler: async (agent: Agent, _input: Record<string, any>) => {
    return agent.getUnifiedBalance();
  },
};
