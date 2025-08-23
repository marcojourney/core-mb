"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreMBConfig = void 0;
class CoreMBConfig {
    constructor(props) {
        this.aesKey = Buffer.from(props.aesKey, "base64");
        this.hmacKey = Buffer.from(props.hmacKey, "base64");
    }
    static initialize(props) {
        if (CoreMBConfig.instance) {
            throw new Error("CoreMBConfig has already been initialized");
        }
        CoreMBConfig.instance = new CoreMBConfig(props);
        return CoreMBConfig.instance;
    }
    // Access the singleton instance
    static getInstance() {
        if (!CoreMBConfig.instance) {
            throw new Error("CoreMBConfig has not been initialized yet");
        }
        return CoreMBConfig.instance;
    }
}
exports.CoreMBConfig = CoreMBConfig;
