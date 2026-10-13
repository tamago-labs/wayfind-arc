"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { ethers } from "ethers";
import { createEthersAdapterFromProvider } from "@circle-fin/adapter-ethers-v6";
import { discoverWallets, connectEVMWallet, switchChain, type EVMWallet } from "@/lib/evm-wallets";
import { SUPPORTED_CHAINS, type ChainConfig } from "@/lib/chains";
import type { EIP1193Provider } from "@/lib/evm-wallets";

export type Adapter = Awaited<ReturnType<typeof createEthersAdapterFromProvider>>;

type WalletType = "evm" | null;

interface WalletState {
  type: WalletType;
  address: string;
  chainId?: number;
  chain?: ChainConfig;
  provider?: ethers.BrowserProvider;
  rawProvider?: EIP1193Provider;
  evmWallets: EVMWallet[];
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  connectEVM: (wallet: EVMWallet) => Promise<void>;
  disconnect: () => void;
  switchToChain: (chainId: number) => Promise<void>;
  getRawProvider: () => EIP1193Provider | undefined;
  getAdapter: () => Adapter | undefined;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    type: null,
    address: "",
    evmWallets: [],
    isConnecting: false,
    error: null,
  });
  const rawProviderRef = useRef<EIP1193Provider | undefined>(undefined);
  const adapterRef = useRef<Adapter | undefined>(undefined);

  useEffect(() => {
    discoverWallets().then((wallets) => {
      setState((s) => ({ ...s, evmWallets: wallets }));
    });
  }, []);

  const connectEVM = useCallback(async (wallet: EVMWallet) => {
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      const { address, chainId, provider } = await connectEVMWallet(wallet);
      const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
      rawProviderRef.current = wallet.provider;
      try {
        adapterRef.current = await createEthersAdapterFromProvider({
          provider: wallet.provider as unknown as ethers.Eip1193Provider,
          capabilities: {},
        });
      } catch {
        adapterRef.current = undefined;
      }
      setState((s) => ({
        ...s,
        type: "evm",
        address,
        chainId,
        chain,
        provider,
        rawProvider: wallet.provider,
        isConnecting: false,
      }));
      try { localStorage.setItem("wayfind:wallet-type", "evm"); } catch {}
    } catch (err) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err instanceof Error ? err.message : "Connection failed",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    rawProviderRef.current = undefined;
    adapterRef.current = undefined;
    setState((s) => ({ ...s, type: null, address: "", chainId: undefined, chain: undefined, rawProvider: undefined }));
    try { localStorage.removeItem("wayfind:wallet-type"); } catch {}
  }, []);

  const switchToChain = useCallback(async (chainId: number) => {
    const wallet = state.evmWallets[0];
    if (!wallet) return;
    await switchChain(wallet.provider, chainId);
    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
    setState((s) => ({ ...s, chainId, chain }));
  }, [state.evmWallets]);

  const getRawProvider = useCallback(() => rawProviderRef.current, []);
  const getAdapter = useCallback(() => adapterRef.current, []);

  return (
    <WalletContext.Provider value={{ ...state, connectEVM, disconnect, switchToChain, getRawProvider, getAdapter }}>
      {children}
    </WalletContext.Provider>
  );
}
