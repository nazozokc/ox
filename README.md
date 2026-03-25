# ox

A simple package manager for local packages.

## Installation

```bash
pnpm install
pnpm build
```

## Usage

```bash
# Install a package
ox install <pkgname>

# Update packages
ox update

# Upgrade packages
ox upgrade
```

## Storage Location

- **Unix:** `~/.ox`
- **Windows:** `C:\Users\<username>\.ox`

Packages are fetched from the remote repository at [https://github.com/nazozokc/ox/tree/main/packages](https://github.com/nazozokc/ox/tree/main/packages).

## Development

```bash
# Build
pnpm build

# Run in development mode
pnpm dev
```

## Tech Stack

- TypeScript
- Node.js
- pnpm
