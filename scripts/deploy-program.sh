#!/bin/bash
set -e 
set -o pipefail

ENVIRONMENT=$1

# Note: Tests are disabled for now because of issues running the tests with the Solana CLI version needed to deploy the program. Go figure.
# Run tests first
# printf "\nRunning tests prior to deployment...\n"
# yarn test || { echo -e "\nTests failed! Please ensure tests are passing before attempting to deploy the program.\n"; exit 1; }

# Make sure there aren't any changes that result from building and copying IDL
if [[ `git status --porcelain` ]]; then
  echo -e "\nBuild and test resulted in working tree changes! Aborting...\n";
  exit 1;
fi

# Define program IDs
MAINNET_PROGRAM_ID="gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk"
DEPLOY_PROGRAM_ID="dgumN6t8fDjoHAbb1K4ySqcP2sWJHaqX9JLNQMDPT9U"

if [[ "$ENVIRONMENT" == "devnet" ]]
then
  cp scripts/anchor-configs/Anchor-dev.toml Anchor.toml
elif [[ "$ENVIRONMENT" == "testnet" ]]
then
  cp scripts/anchor-configs/Anchor-test.toml Anchor.toml
else
  echo -e "\nUnrecognized environment. Only 'devnet' or 'testnet' is allowed.\n"
  exit 1
fi

echo -e "\nDeploying program ID $DEPLOY_PROGRAM_ID to Solana $ENVIRONMENT.\n"

# Swap program id in lib.rs to devnet program ID
sed -i '' "s/$MAINNET_PROGRAM_ID/$DEPLOY_PROGRAM_ID/" programs/bullistic-gumdrop/src/lib.rs

echo -e "All checks passed! Building program...\n"
# Build devnet program
anchor build
echo -e "\nBuild finished!\n"
read -p "Enter y/Y to confirm and proceed with the $ENVIRONMENT program deployment to program ID $DEPLOY_PROGRAM_ID" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  # Deploy program to devnet or testnet
  printf "Calling solana program deploy target/deploy/bullistic_gumdrop.so -u $ENVIRONMENT -k ./keys/$ENVIRONMENT/deployer-keypair.json --program-id ./keys/$ENVIRONMENT/program-keypair.json\n"
  printf "This will take a moment...\n"
  solana program deploy ./target/deploy/bullistic_gumdrop.so -u $ENVIRONMENT -k ./keys/$ENVIRONMENT/deployer-keypair.json --program-id ./keys/$ENVIRONMENT/program-keypair.json
fi

# Swap program id back
sed -i '' "s/$DEPLOY_PROGRAM_ID/$MAINNET_PROGRAM_ID/" programs/bullistic-gumdrop/src/lib.rs

# Restore Anchor.toml
cp scripts/anchor-configs/Anchor-local.toml Anchor.toml

echo -e "Program deploy to $ENVIRONMENT finished successfully! Don't forget to update the Program Versions document.\n"