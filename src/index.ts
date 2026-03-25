#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import { install } from './commands/install.js';
import { update } from './commands/update.js';
import { upgrade } from './commands/upgrade.js';
import { ensureOxDirs } from './utils/config.js';

const program = new Command()
  .name('ox')
  .description('Package manager for local packages')
  .version('1.0.0')
  .hook('preAction', async () => {
    await ensureOxDirs();
  });

program.addCommand(install);
program.addCommand(update);
program.addCommand(upgrade);

await program.parseAsync(process.argv);