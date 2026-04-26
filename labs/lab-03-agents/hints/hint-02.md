# Hint 02 — Lab 03 alt

## Pourquoi un hook même si on a déjà restreint les tools ?

Restreindre les `tools:` du subagent suffit pour empêcher l'usage **explicite** d'Edit/Write par cet auditor.
Mais :

- Le main pourrait, par accident, faire exécuter une tool call malgré tout.
- Un autre subagent pourrait être ajouté plus tard sans la même rigueur.
- Le hook **PreToolUse** est une **defense-in-depth** : il s'applique côté infrastructure, pas seulement côté config agent.

## Matrice tools attendue

| Subagent | Tools |
|----------|-------|
| auditor | Read, Grep, Glob |
| aggregator | Read, Write |

## Forme du payload PreToolUse

Sur stdin :

```json
{
  "session_id": "...",
  "event": "PreToolUse",
  "tool_name": "Write",
  "tool_input": { "file_path": "audit/auth.md", "content": "..." }
}
```

Si `tool_name` est `Edit` ou `Write` et `tool_input.file_path` ne commence pas par `audit/`, le hook doit `exit 2` avec un message en stderr.

## Déclaration dans settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/guard-readonly.sh", "timeout": 5 }
        ]
      }
    ]
  }
}
```
