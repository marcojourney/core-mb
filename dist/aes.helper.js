"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const aesKeyB64 = process.env.PHONE_AES_KEY;
const hmacKeyB64 = process.env.PHONE_HMAC_KEY;
if (!aesKeyB64 || !hmacKeyB64) {
    throw new Error("PHONE_AES_KEY and PHONE_HMAC_KEY must be set (base64-encoded).");
}
const aesKey = Buffer.from(aesKeyB64, "base64");
const hmacKey = Buffer.from(hmacKeyB64, "base64");
/** Normalize to a consistent representation (approx. E.164-like):
 * - Keep leading '+' if present
 * - Remove spaces, dashes, parentheses
 * - Remove any non-digit characters except leading '+'
 * - You can adapt to your locale/validation as needed
 */
function normalize(phoneRaw) {
    if (!phoneRaw)
        return "";
    const trimmed = phoneRaw.trim();
    const hasPlus = trimmed.startsWith("+");
    const digitsOnly = trimmed.replace(/[^\d]/g, "");
    return hasPlus ? `+${digitsOnly}` : digitsOnly; // store either "+855123..." or "0123..."
}
/** Create an HMAC index for lookups without revealing the number.
 * Store this alongside the encrypted data and index it in the DB.
 */
function hmacIndex(phoneRaw) {
    const normalized = normalize(phoneRaw);
    const h = crypto.createHmac("sha256", hmacKey);
    h.update(normalized, "utf8");
    return h.digest("base64");
}
/** Encrypt a phone number using AES-256-GCM.
 * Returns base64-encoded ciphertext, iv and authTag suitable for storage.
 */
function encrypt(phoneRaw) {
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
function decrypt(record) {
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
