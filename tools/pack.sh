#!/bin/bash

# packs extension source files from src/, signs with private key, outputs packed extension to src.crx

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --pack-extension="$(pwd)/../src" --pack-extension-key="$(pwd)/../privkey.pem"
