import { ethers } from "ethers";

// Optional ERC-20 interface for native USDC on Arc (6 decimals)
// https://docs.arc.io/arc/references/contract-addresses
export const USDC_ADDRESSES: Record<number, string> = {
  5042: "0x3600000000000000000000000000000000000000",    // Arc Mainnet
  5042002: "0x3600000000000000000000000000000000000000",  // Arc Testnet
};

const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function fetchUSDCBalance(
  provider: ethers.Provider,
  address: string,
  chainId: number
): Promise<string> {
  const usdcAddress = USDC_ADDRESSES[chainId];
  if (!usdcAddress) return "0.00";

  try {
    const contract = new ethers.Contract(usdcAddress, USDC_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    return Number(ethers.formatUnits(balance, decimals)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return "0.00";
  }
}
