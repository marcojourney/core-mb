export interface ConfigProperties {
    aesKey: string;
    hmacKey: string;
}
export declare class CoreMBConfig {
    private static instance;
    readonly aesKey: Buffer;
    readonly hmacKey: Buffer;
    private constructor();
    static initialize(props: ConfigProperties): CoreMBConfig;
    static getInstance(): CoreMBConfig;
}
