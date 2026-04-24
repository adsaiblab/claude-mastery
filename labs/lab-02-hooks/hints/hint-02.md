# Hint 02 — Lab 02

Squelette de `settings.json` :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/validate-push.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/format-file.sh" }
        ]
      }
    ]
  }
}
```

Le `matcher` est une regex sur `tool_name`. Le hook ne sait pas filtrer plus fin tout seul — fais-le dans le script.

Pour parser le JSON en bash : `jq -r '.tool_input.command'`.
