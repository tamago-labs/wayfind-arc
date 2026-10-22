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

interface StoredWallet {
  encryptedSeed: string;
  salt: string;
  evmAddress: string;
}

function deriveKeyFromPassKey(passkey: string, salt: Buffer): Buffer {
  return pbkdf2Sync(passkey, salt, 100_000, 32, "sha256");
}

function encryptBuffer(buffer: Buffer, key: Buffer): Buffer {
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

async function main() {
  const mnemonic = process.argv[2] || process.env.RECOVERY_MNEMONIC;

  if (!mnemonic) {
    console.error("Usage: npx tsx scripts/recover-wallet.ts \"mnemonic words\"");
    console.error("Or set RECOVERY_MNEMONIC env var.");
    process.exit(1);
  }

  if (!bip39.validateMnemonic(mnemonic)) {
    console.error("Invalid mnemonic.");
    process.exit(1);
  }

  const passkey = process.env.WALLET_PASSKEY;
  if (!passkey) {
    console.error("WALLET_PASSKEY environment variable is required.");
    process.exit(1);
  }

  if (existsSync(WALLET_FILE) && !process.env.OVERWRITE_WALLET) {
    console.error("Wallet already exists. Set OVERWRITE_WALLET=1 to overwrite.");
    process.exit(1);
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const salt = randomBytes(16);
  const key = deriveKeyFromPassKey(passkey, salt);
  const encryptedSeed = encryptBuffer(Buffer.from(seed), key);

  sodium.sodium_memzero(key);

  const evmWallet = new Wallet(Buffer.from(seed).toString("hex"));

  if (!existsSync(WALLET_DIR)) {
    mkdirSync(WALLET_DIR, { recursive: true, mode: 0o700 });
  }

  const stored: StoredWallet = {
    encryptedSeed: encryptedSeed.toString("base64"),
    salt: salt.toString("base64"),
    evmAddress: evmWallet.address,
  };

  writeFileSync(WALLET_FILE, JSON.stringify(stored, null, 2), { mode: 0o600 });

  if (!existsSync(BACKUP_FILE)) {
    writeFileSync(BACKUP_FILE, mnemonic, { mode: 0o600 });
  }

  console.log("Wallet recovered successfully.");
  console.log(`Address: ${evmWallet.address}`);
  console.log(`Saved to: ${WALLET_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
