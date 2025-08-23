import * as crypto from "crypto";
import { normalize } from "./phone.number.helper";

export type PhoneCipherRecord = {
  // Base64 strings suitable for storage in text columns
  ciphertext: string; // Encrypted phone number
  iv: string; // Initialization Vector (nonce) for GCM (12 bytes recommended)
  authTag: string; // Authentication tag returned by GCM (ensures integrity)
  hmacIndex: string; // HMAC-SHA256(phoneNormalized) for search/dedup
};

const aesKeyB64 = process.env.PHONE_AES_KEY;
const hmacKeyB64 = process.env.PHONE_HMAC_KEY;

if (!aesKeyB64 || !hmacKeyB64) {
  throw new Error(
    "PHONE_AES_KEY and PHONE_HMAC_KEY must be set (base64-encoded)."
  );
}

const aesKey = Buffer.from(aesKeyB64, "base64");
const hmacKey = Buffer.from(hmacKeyB64, "base64");

/** Create an HMAC index for lookups without revealing the number.
 * Store this alongside the encrypted data and index it in the DB.
 */
export function hmacIndex(phoneRaw: string): string {
  const normalized = normalize(phoneRaw);
  const h = crypto.createHmac("sha256", hmacKey);
  h.update(normalized, "utf8");
  return h.digest("base64");
}

/** Encrypt a phone number using AES-256-GCM.
 * Returns base64-encoded ciphertext, iv and authTag suitable for storage.
 */
export function phoneEncrypt(
  phoneRaw: string
): Omit<PhoneCipherRecord, "hmacIndex"> & { hmacIndex: string } {
  const normalized = normalize(phoneRaw);

  // 12-byte IV is recommended for GCM
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);

  // Optional: bind additional data (AAD), e.g., tenant ID to prevent cross-tenant swaps
  // cipher.setAAD(Buffer.from(tenantId, 'utf8'));

  const ciphertextBuf = Buffer.concat([
    cipher.update(normalized, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertextBuf.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    hmacIndex: hmacIndex(normalized),
  };
}

/** Decrypt a previously stored record. Throws if tampered.
 * Returns the normalized phone string.
 */
export function phoneDecrypt(
  record: Pick<PhoneCipherRecord, "ciphertext" | "iv" | "authTag">
): string {
  const iv = Buffer.from(record.iv, "base64");
  const authTag = Buffer.from(record.authTag, "base64");
  const ciphertext = Buffer.from(record.ciphertext, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);

  // If you used setAAD on encrypt, you MUST set the same AAD here
  // decipher.setAAD(Buffer.from(tenantId, 'utf8'));

  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");

  return plaintext; // normalized phone
}
