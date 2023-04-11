![](banner.jpeg)

<div align="center">
  <h1>Bullistic Gumdrop</h1>
  <a href="#overview">Overview</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#repo-structure">Repo Structure</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#initial-environment-setup">Initial Environment Setup</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#getting-started">Getting Started</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#releases">Releases</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#useful-links">Useful Links</a>
  <br />
  <hr />
</div>


## Overview

The Bullistic Gumdrop is a port of the [Metaplex Gumdrop Program](https://docs.metaplex.com/airdrops/create-gumdrop) which uses merkle trees to support efficient airdrops of tokens and NFTs. The Bullistic Gumdrop is designed specifically to facilitate airdropping participation NFTs (pNFTs) from creators to auction participants.

- Mainnet address: `gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk`
- Devnet address: `dgumN6t8fDjoHAbb1K4ySqcP2sWJHaqX9JLNQMDPT9U`

## Repo Structure

This repo contains the Solana program source code and the source code for a TypeScript SDK, in addition to some client-side program tests written in TypeScript.

```.
├── artifacts           # 3rd party program binaries (from solana program dump command)
├── keys                # Program keypairs for devnet and testnet
├── programs            # Solana program source code
├── scripts             # Some helper bash scripts
├── src                 # TypeScript source folder
│   ├── generated       # Generated program IDL and type definitions
│   ├── sdk             # Gumdrop program TypeScript SDK
│   └── tests           # Program tests
├── ...                 # Other misc. project config files
└── README.md
```

## Initial Environment Setup

Complete the following to setup your environment:

1. Install [Node.js](https://nodejs.org/en) (and [nvm](https://github.com/nvm-sh/nvm) if you want).
2. Follow the [Anchor setup instructions](https://book.anchor-lang.com/getting_started/installation.html). After this you should have Rust, Solana, Yarn and Anchor installed on your system.

## Getting Started

Once you have your environment setup you can run the following:

```sh
# Install npm dependencies
$ yarn

# Build the program and SDK
$ yarn build

# Run sdk TS only unit tests
$ yarn test-sdk

# Run tests using Anchor (spins up local validator and deploys program)
# Note that you will need to give permission to the test.sh script the first
# time you run the tests (run 'chmod +x ./scripts/test.sh').
$ yarn test

# Run a command like this to test a single file
$ yarn test claimEditionInvalidCases.test

# Run tests in debug mode to show more error output
$ yarn test-debug
```

The following commands are also available:

```sh
# Run prettier checks
$ yarn prettier

# Run eslint checks
$ yarn eslint

# Compile TypeScript code
$ yarn tsc

# Build the program
$ yarn build-program

# Run setup step to copy generated program IDL and types to src/ folder
$ yarn setup

# Build the TS SDK
$ yarn build-sdk
```

## Releases

Releases are based on git tags. There is a GitHub Action which is responsible for running releases.

The Solana program and TS SDK are versioned separately.

### Solana Program

For the Solana program we build a binary using Anchor. To publish a new binary:

1. Increment the version in the program `Cargo.toml` file.
2. Push a commit to the `main` branch in GitHub.

Note that if the Anchor version is upgraded you should update the anchor version in the GitHub action as well.

### Devnet Deployment

Run the following to deploy or upgrade the program on devnet or testnet:

```bash
# Set your CLI to the appropriate cluster.
$ solana config set -u devnet|testnet

# Give the script executable permissions (needed once on first use only)
$ chmod +x ./scripts/deploy-program.sh

# Note: If you are deploying for the first time, you need to specify the deploy
# command program-id argument to point to the program keypair.

# Get the deployer account address.
$ solana-keygen pubkey keys/devnet/deployer-keypair.json

# Ensure you have enough SOL. Repeat the following for the above address
# until you have ~10 SOL or more.
$ solana airdrop 1 G1K5YZmhg1LqaYUC9VXWK7YLCdwqJcVPLpgBt5tmUWVf

# Test, build and deploy the program. Pass argument for network.
$ yarn deploy-program devnet|testnet
```

After the initial deploy you will have to create the Gumdrop Config account. See the below section for the details.

To deploy the program from scratch to a new program address, do the following:

- Update the `DEPLOY_PROGRAM_ID` in `deploy-program.sh`.
- Add the new program address in `Anchor.toml` and all of the Anchor configs in `scripts/anchor-configs`.
- Add the new program and config keypairs for devnet/testnet in `keys/`.
- Update `programIds` with the new addresses.
- Update the address in `keys/README`.
- Run the above deploy steps.
- If you updated the gumdrop config authority address, update the appropriate environment variable in the Bullistic server deployments (local and in GitHub Secrets).

### Mainnet Deployment

Gumdrop is deployed on Solana mainnet at `gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk`.

### Gumdrop Config

The program requires a one-time setup of the Gumdrop Config account. You can create this by running the following:

```bash
# Set the config authority for devnet or testnet
$ yarn set-config devnet|testnet

# Set the config authority for mainnet (this will use the Anchor-prod.toml configuration)
# For the production config account, a new keypair will need to be created and funded with SOL
# prior to running the script.
$ yarn set-config mainnet
```

A similar script exists to update the config authority. The update script expects a keypair for the new update authority to be provided in the relevant folder: `keys/testnet|devnet/update-config-authority-keypair.json`.

```bash
# Update the config authority for devnet or testnet
$ yarn update-config devnet|testnet

# Update the config authority for mainnet (this will use the Anchor-prod.toml configuration)
# For the production config account, a new keypair will need to be created and funded with SOL
# prior to running the script.
$ yarn update-config mainnet
```

**NOTE:** If you update the config authority be sure to update the new `gumdropConfigAuthority` address in `programIds.ts`.

### TypeScript SDK

Follow the following steps to publish a new version of the TypeScript SDK:

1. Run `yarn version` and enter a new appropriate [semver version](https://docs.npmjs.com/about-semantic-versioning) for the npm package. That will create a new tag and commit.
2. Run `git push origin NEW_TAG`.
3. `git push` the new commit as well.

This will push the new release tag to GitHub and trigger the release pipeline, after which clients can install the latest SDK with `yarn add @bullistic-hq/bullistic-gumdrop@latest`.

## Useful Links

- [Gumdrop docs](https://docs.metaplex.com/airdrops/create-gumdrop)
- [Gumdrop web UI](https://lwus.github.io/metaplex/)
- [Metaplex Gumdrop program code](https://github.com/metaplex-foundation/metaplex-program-library/blob/master/gumdrop/program/src/lib.rs)
- [Metaplex Gumdrop CLI and UI code](https://github.com/metaplex-foundation/gumdrop)
