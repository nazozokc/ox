import { simpleGit, SimpleGit } from 'simple-git';
import { getRegistryDir, loadConfig, ensureOxDirs } from './config.js';

export async function initRegistry(): Promise<void> {
  const registryDir = getRegistryDir();
  const config = await loadConfig();

  await ensureOxDirs();

  let isRepo = false;
  try {
    const git: SimpleGit = simpleGit(registryDir);
    isRepo = await git.checkIsRepo();
  } catch {
    isRepo = false;
  }

  if (isRepo) {
    console.log('Updating registry...');
    const git: SimpleGit = simpleGit(registryDir);
    await git.pull();
  } else {
    console.log('Cloning registry...');
    const repoUrl = config.registry.endsWith('.git') 
      ? config.registry 
      : `${config.registry}.git`;
    const fs = await import('fs/promises');
    try {
      await fs.rm(registryDir, { recursive: true, force: true });
    } catch {
      // 存在しない場合は無視
    }
    const git: SimpleGit = simpleGit();
    await git.clone(repoUrl, registryDir);
  }
}

export async function updateRegistry(): Promise<void> {
  const registryDir = getRegistryDir();
  const git: SimpleGit = simpleGit(registryDir);

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await initRegistry();
      return;
    }
    console.log('Pulling latest changes...');
    await git.pull();
  } catch (error) {
    throw new Error(`Failed to update registry: ${error}`);
  }
}

export async function getTags(): Promise<string[]> {
  const registryDir = getRegistryDir();
  const git: SimpleGit = simpleGit(registryDir);

  try {
    const tags = await git.tags();
    return tags.all;
  } catch {
    return [];
  }
}

const TAG_NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

function validateTagName(tag: string): boolean {
  return TAG_NAME_REGEX.test(tag) && !tag.includes('..') && !tag.startsWith('-');
}

export async function checkoutTag(tag: string): Promise<void> {
  if (!validateTagName(tag)) {
    throw new Error(`Invalid tag name '${tag}'`);
  }
  
  const registryDir = getRegistryDir();
  const git: SimpleGit = simpleGit(registryDir);

  try {
    await git.checkout(tag);
  } catch (error) {
    throw new Error(`Failed to checkout tag ${tag}: ${error}`);
  }
}