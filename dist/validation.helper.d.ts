import { ValidationOptions } from "class-validator";
/**
 * Checks that the string is likely an encrypted phone number
 * (e.g., base64 or hex encoded string). Adjust pattern as needed.
 */
export declare function IsEncryptedPhone(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
