import * as dotenv from "dotenv";
import { CoreMBConfig } from "./src/config";

dotenv.config();
CoreMBConfig.initialize({
  aesKey: process.env.PHONE_AES_KEY || "N/A",
  hmacKey: process.env.PHONE_HMAC_KEY || "N/A",
});


