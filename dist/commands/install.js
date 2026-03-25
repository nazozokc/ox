import { Command } from 'commander';
import { installPackage, getAvailablePackages, validatePackageName } from '../utils/packages.js';
import { initRegistry } from '../utils/registry.js';
export const install = new Command()
    .name('install')
    .description('Install a package from the registry')
    .argument('<pkgname>', 'Package name to install')
    .action(async (pkgname) => {
    try {
        if (!validatePackageName(pkgname)) {
            console.error(`Invalid package name '${pkgname}'. Use only letters, numbers, and hyphens.`);
            process.exit(1);
        }
        await initRegistry();
        const available = await getAvailablePackages();
        if (!available.includes(pkgname)) {
            console.error(`Package '${pkgname}' not found in registry`);
            console.log('Available packages:', available.join(', '));
            process.exit(1);
        }
        await installPackage(pkgname);
    }
    catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
});
