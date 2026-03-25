export interface Config {
    registry: string;
}
export declare function getOxDir(): string;
export declare function getConfigPath(): string;
export declare function getRegistryDir(): string;
export declare function getPackagesDir(): string;
export declare function loadConfig(): Promise<Config>;
export declare function saveConfig(config: Config): Promise<void>;
export declare function ensureOxDirs(): Promise<void>;
