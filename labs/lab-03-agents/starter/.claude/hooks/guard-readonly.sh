#!/usr/bin/env bash
# TODO : implémenter le garde-fou.
#
# Reçoit en stdin un payload JSON PreToolUse.
# Si tool_name vaut "Edit" ou "Write" et tool_input.file_path n'est PAS sous audit/,
# alors écrire un message en stderr et exit 2 (bloque la tool call).
# Sinon exit 0.
exit 0
