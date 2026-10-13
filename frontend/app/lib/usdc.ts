import { ethers } from "ethers";

const ERC20_BALANCE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

export async function fetchTokenBalance(
  provider: ethers.Provider,
  tokenAddress: string,
  userAddress: string,
  decimals: number
): Promise<string> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_BALANCE_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    const value = Number(ethers.formatUnits(balance, decimals));
    if (value === 0) return "0.00";
    if (value < 1) return value.toFixed(8).replace(/\.?0+$/, '');
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return "0.00";
  }
}
