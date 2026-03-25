import { Command } from 'commander';
import { listInstalledPackages, installPackage } from '../utils/packages.js';
import { updateRegistry, getTags, checkoutTag } from '../utils/registry.js';
import { getRegistryDir } from '../utils/config.js';
import fs from 'fs/promises';
import path from 'path';

function compareVersions(a: string, b: string): number {
  const parseVersion = (v: string) => {
    const cleaned = v.replace(/^v/, '').replace(/[^\d.]/g, '');
    const parts = cleaned.split('.').map(p => parseInt(p, 10) || 0);
    return parts;
  };
  
  const aParts = parseVersion(a);
  const bParts = parseVersion(b);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) {
      return aVal - bVal;
    }
  }
  return 0;
}

export const upgrade = new Command()
  .name('upgrade')
  .description('Upgrade all installed packages to latest version')
  .action(async () => {
    try {
      await updateRegistry();

      const tags = await getTags();
      if (tags.length === 0) {
        console.log('No tags found in registry');
        return;
      }

      const sortedTags = tags.sort(compareVersions);
      const latestTag = sortedTags.pop()!;
      console.log(`Checking out tag: ${latestTag}`);
      await checkoutTag(latestTag);

      const packages = await listInstalledPackages();
      if (packages.length === 0) {
        console.log('No packages installed');
        return;
      }

      console.log(`Upgrading ${packages.length} package(s)...`);
      let hasErrors = false;
      for (const pkg of packages) {
        try {
          await installPackage(pkg.name);
        } catch (error) {
          console.error(`Failed to upgrade ${pkg.name}: ${error}`);
          hasErrors = true;
        }
      }
      
      if (hasErrors) {
        console.log('Upgrade completed with errors');
        process.exit(1);
      }
      console.log('Upgrade complete');
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });