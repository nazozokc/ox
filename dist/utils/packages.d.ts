export declare function validatePackageName(name: string): boolean;
export interface InstalledPackage {
    name: string;
    version: string;
    path: string;
}
export interface PackageJson {
    name: string;
    version: string;
    description?: string;
}
export declare function listInstalledPackages(): Promise<InstalledPackage[]>;
export declare function getAvailablePackages(): Promise<string[]>;
export declare function installPackage(name: string): Promise<void>;
export declare function uninstallPackage(name: string): Promise<void>;
