export interface ConfigProperties {
  aesKey: string;
  hmacKey: string;
}

export class CoreMBConfig {
  private static instance: CoreMBConfig;
  public readonly aesKey: Buffer;
  public readonly hmacKey: Buffer;

  private constructor(props: ConfigProperties) {
    this.aesKey = Buffer.from(props.aesKey, "base64");
    this.hmacKey = Buffer.from(props.hmacKey, "base64");
  }

  public static initialize(props: ConfigProperties): CoreMBConfig {
    if (CoreMBConfig.instance) {
      throw new Error("CoreMBConfig has already been initialized");
    }
    CoreMBConfig.instance = new CoreMBConfig(props);
    return CoreMBConfig.instance;
  }

  // Access the singleton instance
  public static getInstance(): CoreMBConfig {
    if (!CoreMBConfig.instance) {
      throw new Error("CoreMBConfig has not been initialized yet");
    }
    return CoreMBConfig.instance;
  }
}
