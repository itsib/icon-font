#!/bin/bash

set -e

cd "$(dirname "$0")/.." || exit 1

if [ ! "$(which ots-sanitize 2> /dev/null)" ]; then
  echo -e "\x1b[0;91mYou should install ots-sanitize\x1b[0m"
  echo -e "Try: \n\x1b[0;97msudo apt install opentype-sanitizer\x1b[0m"
  exit 1
fi

npm run build
node icon-font gen

ots-sanitize dist/fonts/icon-font.ttf
ots-sanitize dist/fonts/icon-font.woff
ots-sanitize dist/fonts/icon-font.woff2