---
title: Dependencies & Package Management
description: How project dependencies are managed using pnpm.
---

This project uses [pnpm](https://pnpm.io/) as the package manager for Node.js dependencies.

## Key Files

- **`package.json`**: 
    - Lists project dependencies (`dependencies`) required for production.
    - Lists development dependencies (`devDependencies`) needed for building, testing, linting, etc.
    - Defines scripts (`scripts`) for common tasks like starting the dev server (`dev`), building (`build`), testing (`test`), etc.
    - Contains other project metadata (name, version, etc.).
- **`pnpm-lock.yaml`**: 
    - The pnpm lockfile. It records the exact versions of all dependencies (and their sub-dependencies) installed.
    - Ensures consistent installations across different environments (developer machines, CI/CD, production).
    - **Should be committed to version control.**
- **`node_modules/`**: 
    - Directory where pnpm installs the actual package files.
    - Managed entirely by pnpm based on `package.json` and `pnpm-lock.yaml`.
    - **Should NOT be committed to version control** (listed in `.gitignore`).

## Common pnpm Commands

- **`pnpm install`**: Installs all dependencies listed in `package.json` according to `pnpm-lock.yaml` (or creates/updates the lockfile if needed).
- **`pnpm add <package-name>`**: Adds a new runtime dependency to `dependencies` in `package.json` and installs it.
- **`pnpm add -D <package-name>`**: Adds a new development dependency to `devDependencies` in `package.json` and installs it.
- **`pnpm remove <package-name>`**: Removes a dependency from `package.json` and uninstalls it.
- **`pnpm update`**: Updates dependencies to their latest allowed versions according to `package.json` version ranges and updates `pnpm-lock.yaml`.
- **`pnpm run <script-name>`**: Executes a script defined in the `scripts` section of `package.json` (e.g., `pnpm run build`).

## Why pnpm?

pnpm is often chosen for its efficiency:

- **Disk Space Savings:** Uses a content-addressable store to avoid duplicating packages across projects.
- **Speed:** Often faster installations compared to npm or Yarn classic due to its architecture.
- **Strictness:** Creates a non-flat `node_modules` structure by default, preventing issues where packages might implicitly access undeclared dependencies. 