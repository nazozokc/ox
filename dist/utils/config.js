import os from 'os';
import path from 'path';
import fs from 'fs/promises';
const DEFAULT_CONFIG = {
    registry: 'https://github.com/nazozokc/ox',
};
export function getOxDir() {
    return path.join(os.homedir(), '.ox');
}
export function getConfigPath() {
    return path.join(getOxDir(), 'config.json');
}
export function getRegistryDir() {
    return path.join(getOxDir(), 'registry');
}
export function getPackagesDir() {
    return path.join(getOxDir(), 'packages');
}
export async function loadConfig() {
    const configPath = getConfigPath();
    try {
        const data = await fs.readFile(configPath, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
    catch {
        return DEFAULT_CONFIG;
    }
}
export async function saveConfig(config) {
    const configPath = getConfigPath();
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}
export async function ensureOxDirs() {
    await fs.mkdir(getOxDir(), { recursive: true });
    await fs.mkdir(getPackagesDir(), { recursive: true });
}
