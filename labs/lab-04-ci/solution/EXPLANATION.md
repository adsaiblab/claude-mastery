# Solution — Lab 04

## Ce que le lab teste

- **Permissions minimales** — ne pas coller `write-all`, scoper finement.
- **Sortie structurée** — forcer JSON dès le prompt, pas du markdown libre à reparser.
- **Gate explicite** — le required check doit être un step distinct qui `exit 1` proprement, configurable comme branch protection.

## Pourquoi pas "action qui fait tout" ?

Claude fait la review, mais la glue (checkout, diff, comment, gate) reste du GitHub Actions classique. Ne laisse pas Claude lancer `gh pr comment` lui-même — le step dédié est plus audit-friendly et plus rapide.

## Pièges

- **`secrets.ANTHROPIC_API_KEY` absent** → le step plante sans message clair. Ajoute un step qui `exit 1` si le secret est vide.
- **Prompt non contraint** → Claude répond en markdown + JSON, `jq` plante. Force "uniquement JSON".
- **`fetch-depth: 1`** → pas de diff avec la base. Toujours `fetch-depth: 0` pour les reviews.
- **Timeout absent** → une review qui boucle consomme des minutes CI. Cap à 10 min.

## Pour aller plus loin

- Cache les résultats par SHA pour éviter de re-reviewer après un rebase identique.
- Ajoute un label `claude-approved` quand score ≥ 9, pour fast-track.
