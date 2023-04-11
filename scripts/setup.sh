#!/bin/bash

IDL_INPUT_FILE=target/types/bullistic_gumdrop.ts
PREVIOUS_IDL=target/types/previous_bullistic_gumdrop.ts

IDL_OUTPUT_FILE=src/sdk/idl/BullisticGumdrop.ts

# Only run if program IDL has changed.
if ! cmp --silent -- "$IDL_INPUT_FILE" "$PREVIOUS_IDL"; then
  echo "Program IDL $IDL_INPUT_FILE changed, running script to modify IDL and generate SDK types..."
  cp $IDL_INPUT_FILE $IDL_OUTPUT_FILE
  yarn modify-program-idl
  npx eslint --cache --fix $IDL_OUTPUT_FILE
fi

cp $IDL_INPUT_FILE $PREVIOUS_IDL