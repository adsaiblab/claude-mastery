# Hint 02 — Lab 04

Deux approches valides :

**Option A — Action officielle `anthropics/claude-code-action`**
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    prompt: "Review cette PR. Renvoie JSON {score:0-10, summary:string, comments:[...]}."
    allowed_tools: "Read,Grep,Glob"
    model: "claude-sonnet-4-6"
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Option B — SDK TypeScript en script Node**
```yaml
- run: node .github/scripts/review.js
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Force la sortie JSON dans le prompt ("réponds uniquement en JSON valide, sans markdown"). Parse avec `jq` ou `JSON.parse`.
