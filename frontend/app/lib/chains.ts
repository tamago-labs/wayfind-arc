export interface ChainConfig {
  id: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  fallbackRpcs?: string[];
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  color: string;
}

export const ARC_MAINNET: ChainConfig = {
  id: 5042,
  name: "Arc",
  shortName: "ARC",
  rpcUrl: "https://rpc.mainnet.arc.io",
  explorerUrl: "https://explorer.arc.io",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  color: "#6C5CE7",
};

export const ARC_TESTNET: ChainConfig = {
  id: 5042002,
  name: "Arc Testnet",
  shortName: "ARC",
  rpcUrl: "https://rpc.testnet.arc.io",
  explorerUrl: "https://explorer.testnet.arc.io",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  color: "#6C5CE7",
};

export const SUPPORTED_CHAINS: ChainConfig[] = [ARC_MAINNET, ARC_TESTNET];

export function getChainById(id: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === id);
}

export function getAddChainParams(chain: ChainConfig) {
  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    rpcUrls: [chain.rpcUrl],
    nativeCurrency: chain.nativeCurrency,
    blockExplorerUrls: [chain.explorerUrl],
  };
}
