// phone.number.crypto.spec.ts
import * as crypto from "crypto";
import { phoneEncrypt, phoneDecrypt } from "../src/security.helper";
import { normalize } from "../src/phone.number.helper";

// Mock environment variables for testing
process.env.PHONE_AES_KEY = crypto.randomBytes(32).toString("base64"); // 256-bit key
process.env.PHONE_HMAC_KEY = crypto.randomBytes(32).toString("base64");

describe("phone.number.crypto", () => {
  const samplePhones = [
    "+1 (234) 567-8900",
    "0123-456-789",
    "+855 12 345 678",
    "00123456789",
  ];

  it("should encrypt and decrypt correctly", () => {
    samplePhones.forEach((phone) => {
      const encrypted = phoneEncrypt(phone);

      // decrypt should return normalized phone
      const decrypted = phoneDecrypt(encrypted);
      expect(decrypted).toBe(normalize(phone));

      // ciphertext, iv, authTag should be base64 strings
      expect(encrypted.ciphertext).toMatch(/^[A-Za-z0-9+/]+=*$/);
      expect(encrypted.iv).toMatch(/^[A-Za-z0-9+/]+=*$/);
      expect(encrypted.authTag).toMatch(/^[A-Za-z0-9+/]+=*$/);

      // hmacIndex should be base64 and consistent with normalized phone
      expect(encrypted.hmacIndex).toBeDefined();
    });
  });

  it("should produce different ciphertexts for same phone (unique IV)", () => {
    const phone = "+85512345678";
    const e1 = phoneEncrypt(phone);
    const e2 = phoneEncrypt(phone);

    expect(e1.ciphertext).not.toBe(e2.ciphertext);
    expect(e1.iv).not.toBe(e2.iv);
    expect(e1.authTag).not.toBe(e2.authTag);

    // hmacIndex should remain the same
    expect(e1.hmacIndex).toBe(e2.hmacIndex);
  });

  it("should throw when tampering with ciphertext", () => {
    const encrypted = phoneEncrypt("+85512345678");

    // tamper with ciphertext
    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -2) + "AA",
    };
    expect(() => phoneDecrypt(tampered)).toThrow();
  });

  it("should throw when tampering with authTag", () => {
    const encrypted = phoneEncrypt("+85512345678");

    const tampered = {
      ...encrypted,
      authTag: encrypted.authTag.slice(0, -2) + "AA",
    };
    expect(() => phoneDecrypt(tampered)).toThrow();
  });
});
