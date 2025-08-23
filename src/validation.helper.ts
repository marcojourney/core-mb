import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

/**
 * Checks that the string is likely an encrypted phone number
 * (e.g., base64 or hex encoded string). Adjust pattern as needed.
 */
export function IsEncryptedPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isEncryptedPhone",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") return false;

          // Example: allow hex or base64 strings
          // Hex pattern (32+ chars, adjust length as needed)
          const hexPattern = /^[a-fA-F0-9]+$/;
          // Base64 pattern
          const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

          return hexPattern.test(value) || base64Pattern.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an encrypted phone string (hex or base64)`;
        },
      },
    });
  };
}
