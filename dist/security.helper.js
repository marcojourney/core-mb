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
exports.hmacIndex = hmacIndex;
exports.phoneEncrypt = phoneEncrypt;
exports.phoneDecrypt = phoneDecrypt;
const crypto = __importStar(require("crypto"));
const config_1 = require("./config");
const phone_number_helper_1 = require("./phone.number.helper");
/** Create an HMAC index for lookups without revealing the number.
 * Store this alongside the encrypted data and index it in the DB.
 */
function hmacIndex(phoneRaw) {
    const normalized = (0, phone_number_helper_1.normalize)(phoneRaw);
    const h = crypto.createHmac("sha256", config_1.CoreMBConfig.getInstance().hmacKey);
    h.update(normalized, "utf8");
    return h.digest("base64");
}
/** Encrypt a phone number using AES-256-GCM.
 * Returns base64-encoded ciphertext, iv and authTag suitable for storage.
 */
function phoneEncrypt(phoneRaw) {
    const normalized = (0, phone_number_helper_1.normalize)(phoneRaw);
    // 12-byte IV is recommended for GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", config_1.CoreMBConfig.getInstance().aesKey, iv);
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
function phoneDecrypt(record) {
    const iv = Buffer.from(record.iv, "base64");
    const authTag = Buffer.from(record.authTag, "base64");
    const ciphertext = Buffer.from(record.ciphertext, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", config_1.CoreMBConfig.getInstance().aesKey, iv);
    // If you used setAAD on encrypt, you MUST set the same AAD here
    // decipher.setAAD(Buffer.from(tenantId, 'utf8'));
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]).toString("utf8");
    return plaintext; // normalized phone
}
