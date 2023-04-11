#!/bin/bash

echo -e "\nSwapping localnet program ID into program lib.rs to run local test suite.\n"

# Interpret first argument as test pattern to run
TESTS=$1

MAINNET_PROGRAM_ID="gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk"
LOCALNET_PROGRAM_ID="Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"

# Swap in localnet program ID
sed -i '' "s/$MAINNET_PROGRAM_ID/$LOCALNET_PROGRAM_ID/" programs/bullistic-gumdrop/src/lib.rs

anchor test $TESTS

# Swap mainnet program ID back
sed -i '' "s/$LOCALNET_PROGRAM_ID/$MAINNET_PROGRAM_ID/" programs/bullistic-gumdrop/src/lib.rs
