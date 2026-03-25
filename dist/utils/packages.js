import fs from 'fs/promises';
import path from 'path';
import { getPackagesDir, getRegistryDir, ensureOxDirs } from './config.js';
const PACKAGE_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/;
export function validatePackageName(name) {
    return PACKAGE_NAME_REGEX.test(name) && name.length <= 214;
}
export async function listInstalledPackages() {
    const packagesDir = getPackagesDir();
    const packages = [];
    try {
        const entries = await fs.readdir(packagesDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const pkgJsonPath = path.join(packagesDir, entry.name, 'package.json');
                try {
                    const data = await fs.readFile(pkgJsonPath, 'utf-8');
                    const pkg = JSON.parse(data);
                    if (!pkg.name || !pkg.version) {
                        console.warn(`Warning: Invalid package.json in '${entry.name}': missing name or version`);
                        continue;
                    }
                    packages.push({
                        name: pkg.name,
                        version: pkg.version,
                        path: path.join(packagesDir, entry.name),
                    });
                }
                catch (error) {
                    console.warn(`Warning: Failed to read package.json in '${entry.name}': ${error}`);
                }
            }
        }
    }
    catch {
        // No packages installed yet
    }
    return packages;
}
export async function getAvailablePackages() {
    const registryDir = getRegistryDir();
    const packagesDir = path.join(registryDir, 'packages');
    const packages = [];
    try {
        const entries = await fs.readdir(packagesDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                packages.push(entry.name);
            }
        }
    }
    catch {
        // Registry not initialized
    }
    return packages;
}
async function isSymbolicLink(dirPath) {
    try {
        const stats = await fs.lstat(dirPath);
        return stats.isSymbolicLink();
    }
    catch {
        return false;
    }
}
async function validateNoSymlinks(dirPath) {
    const packagesBaseDir = getPackagesDir();
    const resolvedBase = await fs.realpath(packagesBaseDir);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isSymbolicLink()) {
            const resolved = await fs.realpath(entryPath);
            if (!resolved.startsWith(resolvedBase)) {
                return false;
            }
        }
        if (entry.isDirectory()) {
            if (!(await validateNoSymlinks(entryPath))) {
                return false;
            }
        }
    }
    return true;
}
export async function installPackage(name) {
    if (!validatePackageName(name)) {
        throw new Error(`Invalid package name '${name}'. Use only letters, numbers, and hyphens.`);
    }
    const registryDir = getRegistryDir();
    const sourceDir = path.join(registryDir, 'packages', name);
    const destDir = path.join(getPackagesDir(), name);
    try {
        await fs.access(sourceDir);
    }
    catch {
        throw new Error(`Package '${name}' not found in registry`);
    }
    if (!(await validateNoSymlinks(sourceDir))) {
        throw new Error(`Package '${name}' contains invalid symbolic links`);
    }
    await ensureOxDirs();
    try {
        await fs.access(destDir);
        console.log(`Package '${name}' is already installed`);
        return;
    }
    catch {
        // Not installed yet, proceed
    }
    try {
        await fs.cp(sourceDir, destDir, { recursive: true });
        console.log(`Installed '${name}'`);
    }
    catch (error) {
        try {
            await fs.rm(destDir, { recursive: true, force: true });
        }
        catch { }
        throw new Error(`Failed to install '${name}': ${error}`);
    }
}
export async function uninstallPackage(name) {
    const destDir = path.join(getPackagesDir(), name);
    try {
        await fs.access(destDir);
    }
    catch {
        throw new Error(`Package '${name}' is not installed`);
    }
    await fs.rm(destDir, { recursive: true });
    console.log(`Uninstalled '${name}'`);
}
