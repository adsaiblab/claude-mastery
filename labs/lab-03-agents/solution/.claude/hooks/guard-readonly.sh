#!/usr/bin/env bash
set -u
payload=$(cat)
tool_name=$(echo "$payload" | jq -r '.tool_name // ""')
case "$tool_name" in
  Edit|Write) ;;
  *) exit 0 ;;
esac
file_path=$(echo "$payload" | jq -r '.tool_input.file_path // ""')
case "$file_path" in
  audit/*) exit 0 ;;
  *)
    echo "guard-readonly: écriture refusée hors audit/ (cible: $file_path)" >&2
    exit 2
    ;;
esac
