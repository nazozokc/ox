import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export interface Config {
  registry: string;
}

const DEFAULT_CONFIG: Config = {
  registry: 'https://github.com/nazozokc/ox',
};

export function getOxDir(): string {
  return path.join(os.homedir(), '.ox');
}

export function getConfigPath(): string {
  return path.join(getOxDir(), 'config.json');
}

export function getRegistryDir(): string {
  return path.join(getOxDir(), 'registry');
}

export function getPackagesDir(): string {
  return path.join(getOxDir(), 'packages');
}

export async function loadConfig(): Promise<Config> {
  const configPath = getConfigPath();
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const configPath = getConfigPath();
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

export async function ensureOxDirs(): Promise<void> {
  await fs.mkdir(getOxDir(), { recursive: true });
  await fs.mkdir(getPackagesDir(), { recursive: true });
}