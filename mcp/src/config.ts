import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { randomBytes, pbkdf2Sync } from "crypto";
import sodium from "sodium-native";
import * as bip39 from "bip39";
import { Wallet } from "ethers";

const WALLET_DIR = join(homedir(), ".wayfind-arc");
const WALLET_FILE = join(WALLET_DIR, ".wallet.json");
const BACKUP_FILE = join(WALLET_DIR, "BACKUP_AND_REMOVE.txt");

export interface ArcConfig {
  chain: "mainnet" | "testnet";
  rpcUrl: string;
  explorerUrl: string;
  chainId: number;
  privateKey: string;
  walletAddress: string;
}

const CHAIN_CONFIGS: Record<string, { rpcUrl: string; explorerUrl: string; chainId: number; circleChain: string }> = {
  mainnet: {
    rpcUrl: "https://rpc.mainnet.arc.io",
    explorerUrl: "https://explorer.arc.io",
    chainId: 5042,
    circleChain: "Arc",
  },
  testnet: {
    rpcUrl: "https://rpc.testnet.arc.io",
    explorerUrl: "https://explorer.testnet.arc.io",
    chainId: 5042002,
    circleChain: "Arc_Testnet",
  },
};

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
  if (process.env.ARC_PRIVATE_KEY) {
    const key = process.env.ARC_PRIVATE_KEY.replace(/^0x/, "");
    return { seed: new Uint8Array(Buffer.from(key, "hex")), mnemonic: null };
  }

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
      "WALLET_PASSKEY environment variable is required for wallet creation.\n" +
      "Set it before running the MCP server.\n" +
      "Example: export WALLET_PASSKEY=\"your-secure-passphrase\"\n" +
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

  const evmWallet = new Wallet(Buffer.from(seed).toString("hex"));

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

export async function loadArcConfig(): Promise<ArcConfig> {
  const chain = (process.env.ARC_CHAIN || "mainnet") as "mainnet" | "testnet";
  const chainConfig = CHAIN_CONFIGS[chain];

  const { seed } = await loadOrCreateWalletKey();

  const privateKey = "0x" + Buffer.from(seed).toString("hex");
  const wallet = new Wallet(privateKey);

  process.on("exit", () => seed.fill(0));

  return {
    chain,
    rpcUrl: process.env.ARC_RPC_URL || chainConfig.rpcUrl,
    explorerUrl: process.env.ARC_EXPLORER_URL || chainConfig.explorerUrl,
    chainId: chainConfig.chainId,
    privateKey,
    walletAddress: wallet.address,
  };
}

export function getCircleChainName(config: ArcConfig): string {
  return config.chain === "testnet" ? "Arc_Testnet" : "Arc";
}
