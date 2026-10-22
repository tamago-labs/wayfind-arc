import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { randomBytes, pbkdf2Sync } from "crypto";
import sodium from "sodium-native";
import * as bip39 from "bip39";
import { Wallet } from "ethers";
import arcMainnet from "./data/chains/arc-mainnet.json";
import arcTestnet from "./data/chains/arc-testnet.json";
import ethereumMainnet from "./data/chains/ethereum-mainnet.json";
import ethereumTestnet from "./data/chains/ethereum-testnet.json";
import baseMainnet from "./data/chains/base-mainnet.json";
import baseTestnet from "./data/chains/base-testnet.json";
import arbitrumMainnet from "./data/chains/arbitrum-mainnet.json";
import avalancheMainnet from "./data/chains/avalanche-mainnet.json";
import optimismMainnet from "./data/chains/optimism-mainnet.json";
import polygonMainnet from "./data/chains/polygon-mainnet.json";
import seiMainnet from "./data/chains/sei-mainnet.json";
import worldMainnet from "./data/chains/world-mainnet.json";

const WALLET_DIR = join(homedir(), ".wayfind-arc");
const WALLET_FILE = join(WALLET_DIR, ".wallet.json");
const BACKUP_FILE = join(WALLET_DIR, "BACKUP_AND_REMOVE.txt");

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  "arc-mainnet": arcMainnet,
  "arc-testnet": arcTestnet,
  "ethereum-mainnet": ethereumMainnet,
  "ethereum-testnet": ethereumTestnet,
  "base-mainnet": baseMainnet,
  "base-testnet": baseTestnet,
  "arbitrum-mainnet": arbitrumMainnet,
  "avalanche-mainnet": avalancheMainnet,
  "optimism-mainnet": optimismMainnet,
  "polygon-mainnet": polygonMainnet,
  "sei-mainnet": seiMainnet,
  "world-mainnet": worldMainnet,
};

export type NetworkMode = "testnet" | "mainnet";

export interface ChainConfig {
  chain: string;
  network: string;
  chainId: number;
  nativeCurrency: { symbol: string; name: string; decimals: number };
  tokens: { symbol: string; name: string; decimals: number; address: string }[];
}

export interface ArcConfig {
  network: NetworkMode;
  privateKey: string;
  walletAddress: string;
}

interface StoredWallet {
  encryptedSeed: string;
  salt: string;
  evmAddress: string;
}

function deriveKeyFromPassKey(passkey: string, salt: Buffer): Buffer {
  return pbkdf2Sync(passkey, salt, 100_000, 32, "sha256");
}

function encryptBuffer(buffer: Buffer, key: Buffer): Buffer {
  if (buffer.byteLength < 16 || buffer.byteLength > 64) {
    throw new Error("Buffer size must be between 16 and 64");
  }

  const nonce = randomBytes(sodium.crypto_secretbox_NONCEBYTES);
  const plain = Buffer.alloc(1 + buffer.byteLength);
  plain[0] = buffer.byteLength;
  buffer.copy(plain, 1);

  const cipher = Buffer.alloc(plain.byteLength + sodium.crypto_secretbox_MACBYTES);
  sodium.crypto_secretbox_easy(cipher, plain, nonce, key);

  const payload = Buffer.alloc(1 + nonce.byteLength + cipher.byteLength);
  payload[0] = 0;
  nonce.copy(payload, 1);
  cipher.copy(payload, 1 + nonce.byteLength);

  return payload;
}

function decryptBuffer(payload: Buffer, key: Buffer): Buffer {
  const minLength = 1 + sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES + 1;
  if (payload.byteLength < minLength) {
    throw new Error("Invalid payload: too short");
  }
  if (payload[0] !== 0) {
    throw new Error("Invalid version");
  }

  const nonce = payload.subarray(1, 1 + sodium.crypto_secretbox_NONCEBYTES);
  const cipher = payload.subarray(1 + nonce.byteLength);

  const plain = Buffer.alloc(cipher.byteLength - sodium.crypto_secretbox_MACBYTES);
  if (!sodium.crypto_secretbox_open_easy(plain, cipher, nonce, key)) {
    throw new Error("Decryption failed");
  }

  const byteLength = plain[0];
  if (byteLength < 16 || byteLength > 64 || plain.byteLength < 1 + byteLength) {
    throw new Error("Invalid decrypted payload");
  }

  return Buffer.from(plain.subarray(1, 1 + byteLength));
}

async function loadOrCreateWalletKey(): Promise<{ seed: Uint8Array; mnemonic: string | null }> {
  if (existsSync(WALLET_FILE)) {
    const raw: StoredWallet = JSON.parse(readFileSync(WALLET_FILE, "utf-8"));

    const passkey = process.env.WALLET_PASSKEY;
    if (!passkey) {
      throw new Error("WALLET_PASSKEY environment variable is required to decrypt wallet.");
    }

    const salt = Buffer.from(raw.salt, "base64");
    const key = deriveKeyFromPassKey(passkey, salt);
    const seed = decryptBuffer(Buffer.from(raw.encryptedSeed, "base64"), key);

    sodium.sodium_memzero(key);

    return { seed: new Uint8Array(seed), mnemonic: null };
  }

  const passkey = process.env.WALLET_PASSKEY;
  if (!passkey) {
    throw new Error(
      "WALLET_PASSKEY environment variable is required.\n" +
      "Set it before running the MCP server to auto-generate an encrypted wallet.\n" +
      "Must be at least 12 characters."
    );
  }

  const randomEntropy = randomBytes(16);
  const mnemonic = bip39.entropyToMnemonic(randomEntropy.toString("hex"));
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  const salt = randomBytes(16);
  const key = deriveKeyFromPassKey(passkey, salt);
  const encryptedSeed = encryptBuffer(Buffer.from(seed), key);

  sodium.sodium_memzero(key);

  const evmPrivateKey = Buffer.from(seed.subarray(32, 64)).toString("hex");
  const evmWallet = new Wallet(evmPrivateKey);

  if (!existsSync(WALLET_DIR)) {
    mkdirSync(WALLET_DIR, { recursive: true, mode: 0o700 });
  }

  if (!existsSync(BACKUP_FILE)) {
    writeFileSync(BACKUP_FILE, mnemonic, { mode: 0o600 });
  }

  const stored: StoredWallet = {
    encryptedSeed: encryptedSeed.toString("base64"),
    salt: salt.toString("base64"),
    evmAddress: evmWallet.address,
  };

  writeFileSync(WALLET_FILE, JSON.stringify(stored, null, 2), { mode: 0o600 });

  return { seed: new Uint8Array(seed), mnemonic };
}

export function getNetworkMode(): NetworkMode {
  return process.env.WAYFIND_NETWORK === "mainnet" ? "mainnet" : "testnet";
}

export function loadChainConfigs(): ChainConfig[] {
  return Object.values(CHAIN_CONFIGS);
}

export function getSupportedChains(network?: NetworkMode): string[] {
  const net = network ?? getNetworkMode();
  return Object.values(CHAIN_CONFIGS)
    .filter((c) => c.network === net)
    .map((c) => c.chain);
}

export function getChainConfig(chain: string, network?: NetworkMode): ChainConfig | undefined {
  const net = network ?? getNetworkMode();
  return CHAIN_CONFIGS[`${chain}-${net}`];
}

export function toCircleChain(chain: string): string {
  const network = getNetworkMode();
  const mainnetMap: Record<string, string> = {
    ethereum: "Ethereum",
    base: "Base",
    arbitrum: "Arbitrum",
    polygon: "Polygon",
    avalanche: "Avalanche",
    optimism: "Optimism",
    world: "World_Chain",
    sei: "Sei",
    arc: "Arc",
  };

  const testnetMap: Record<string, string> = {
    ethereum: "Ethereum_Sepolia",
    base: "Base_Sepolia",
    arbitrum: "Arbitrum_Sepolia",
    polygon: "Polygon_Amoy_Testnet",
    avalanche: "Avalanche_Testnet",
    optimism: "Optimism_Sepolia",
    world: "World_Chain_Sepolia",
    sei: "Sei_Testnet",
    arc: "Arc_Testnet",
  };

  const map = network === "testnet" ? testnetMap : mainnetMap;
  return map[chain] || chain;
}

export async function loadArcConfig(): Promise<ArcConfig> {
  const network = getNetworkMode();

  const { seed } = await loadOrCreateWalletKey();

  const privateKey = "0x" + Buffer.from(seed.subarray(32, 64)).toString("hex");
  const wallet = new Wallet(privateKey);

  process.on("exit", () => seed.fill(0));

  return {
    network,
    privateKey,
    walletAddress: wallet.address,
  };
}
