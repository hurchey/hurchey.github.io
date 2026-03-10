#!/bin/zsh

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  local nvm_root="$HOME/.nvm/versions/node"
  if [[ -d "$nvm_root" ]]; then
    local latest_node
    latest_node=$(ls -1d "$nvm_root"/v*/bin/node 2>/dev/null | sort -V | tail -n 1)
    if [[ -n "$latest_node" ]]; then
      echo "$latest_node"
      return 0
    fi
  fi

  return 1
}

NODE_BIN=$(find_node) || {
  echo "Unable to find a Node.js binary in PATH or ~/.nvm/versions/node." >&2
  exit 1
}

echo "Using Node: $NODE_BIN"
"$NODE_BIN" --check "$ROOT_DIR/content.js"
"$NODE_BIN" --check "$ROOT_DIR/main.js"
"$NODE_BIN" --check "$ROOT_DIR/quant.js"
echo "JavaScript syntax checks passed."
