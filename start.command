#!/bin/zsh
cd "$(dirname "$0")"
# Use the local runtime set up for this Mac, or a normally installed Node.js.
studyflow_runtime="$PWD/../../work/node-v22.23.2-darwin-arm64/bin"
if [ -x "$studyflow_runtime/node" ]; then
  export PATH="$studyflow_runtime:$PATH"
fi
export npm_config_cache="$PWD/../../work/npm-cache"
if ! command -v npm >/dev/null; then
  echo 'Install Node.js 22 LTS from nodejs.org, then open this file again.'
  read
  exit 1
fi
if [ ! -d node_modules ]; then
  npm ci || exit 1
fi
npm run dev
