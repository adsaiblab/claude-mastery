# Hint 01 — Lab 02

Un hook reçoit son payload **JSON sur stdin**. Structure pour `PreToolUse` :

```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "git push origin main" }
}
```

Code de retour :
- `exit 0` → OK, Claude continue.
- `exit 2` → **bloque** + stderr est renvoyé à Claude comme message d'erreur.
- Autre code → warning, n'empêche pas.

Pense à rendre tes scripts `chmod +x`.
