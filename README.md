# Cloudcache Monorepo

[![Powered by Cloudflare](https://img.shields.io/badge/powered%20by-Cloudflare-F48120?logo=cloudflare)](https://www.cloudflare.com/)

This repository contains the full source code for the Cloudcache suite of applications and services.

---

## 🛑 System of Record: The Golden Path

**All developers, start here.**

For all deployment, validation, and standard operational procedures, refer to our single source of truth:

➡️ **[docs/all-system-truth.md](docs/all-system-truth.md)**

This document contains the "Golden Path" for all pipeline activities and is the definitive entry point for understanding how to build, deploy, and validate our software. Its guidance trumps all other documentation.

---

## Project Structure

-   `apps/`: Contains the source code for each of our three main modules:
    -   `app`: The main customer-facing application.
-   `admin`: The internal administration dashboard.
-   `apex`: The primary marketing and landing page.
-   `packages/`: Shared libraries and utilities used across the monorepo.
-   `scripts/`: Contains all operational scripts for deployment, validation, etc.
-   `docs/`: All project documentation, including our System of Record.

## Development

To start the local development environment for all modules simultaneously, run:

`pnpm dev`
