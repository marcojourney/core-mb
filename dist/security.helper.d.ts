export type PhoneCipherRecord = {
    ciphertext: string;
    iv: string;
    authTag: string;
    hmacIndex: string;
};
/** Create an HMAC index for lookups without revealing the number.
 * Store this alongside the encrypted data and index it in the DB.
 */
export declare function hmacIndex(phoneRaw: string): string;
/** Encrypt a phone number using AES-256-GCM.
 * Returns base64-encoded ciphertext, iv and authTag suitable for storage.
 */
export declare function phoneEncrypt(phoneRaw: string): Omit<PhoneCipherRecord, "hmacIndex"> & {
    hmacIndex: string;
};
/** Decrypt a previously stored record. Throws if tampered.
 * Returns the normalized phone string.
 */
export declare function phoneDecrypt(record: Pick<PhoneCipherRecord, "ciphertext" | "iv" | "authTag">): string;
