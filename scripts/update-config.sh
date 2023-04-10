#!/bin/bash -e

ENVIRONMENT=$1

echo -e "\nUsing environment: $ENVIRONMENT"

# We use the same keys for devnet and testnet
if [[ "$ENVIRONMENT" == "devnet" ]]
then
  cp scripts/anchor-configs/Anchor-dev.toml Anchor.toml
elif [[ "$ENVIRONMENT" == "testnet" ]]
then
  cp scripts/anchor-configs/Anchor-test.toml Anchor.toml
elif [[ "$ENVIRONMENT" == "mainnet" ]]
then
  cp scripts/anchor-configs/Anchor-prod.toml Anchor.toml
else
  echo -e "Unrecognized environment. Only 'devnet', 'testnet' or 'mainnet' are allowed."
  exit 1
fi

echo -e "\nRunning updateGumdropConfigScript script.\n"

anchor run update-config

cp scripts/anchor-configs/Anchor-local.toml Anchor.toml

echo -e "Success!"