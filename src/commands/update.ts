import { Command } from 'commander';
import { updateRegistry } from '../utils/registry.js';

export const update = new Command()
  .name('update')
  .description('Update the registry (git pull)')
  .action(async () => {
    try {
      await updateRegistry();
      console.log('Registry updated successfully');
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });