# Labs — Claude Mastery Path

Chaque lab suit la même structure (Doc A §"Structure de chaque Lab") :

```
lab-XX-nom/
├── README.md               # énoncé détaillé
├── setup.sh                # prépare l'environnement (executable)
├── validate.sh             # vérifie la solution — sortie colorée binaire (executable)
├── hints/
│   ├── hint-01.md          # indice doux
│   ├── hint-02.md          # indice moyen
│   └── hint-03.md          # indice fort (quasi-solution)
├── starter/                # état initial incomplet à partir duquel tu travailles
└── solution/
    └── EXPLANATION.md      # solution commentée (à ne consulter qu'en dernier recours)
```

## Conventions

- `setup.sh` et `validate.sh` sont **idempotents**.
- `validate.sh` retourne **exit 0** si tout passe, **exit 1** sinon, avec message coloré (`✓` vert / `✗` rouge).
- Les dépendances nécessaires sont déclarées au début du `README.md` de chaque lab.
- Les corrections ne modifient **jamais** le `starter/` — on travaille dans un clone ou un dossier `work/`.

## Utilisation

```bash
cd labs/lab-01-setup
./setup.sh          # initialise le terrain
# … tu travailles …
./validate.sh       # vérifie
```

## Index

| Lab | Niveau | Durée | Thème |
|-----|--------|-------|-------|
| lab-01-setup | 01 Fondations | ~45 min | CLAUDE.md + session + memory |
| lab-02-hooks | 02 CLI Mastery | ~60 min | Hooks PreToolUse + PostToolUse |
| lab-03-pipeline | 03 Multi-agents | ~90 min | Pipeline 5 subagents + judge |
| lab-04-ci | 04 Production | ~75 min | GitHub Action avec Claude |
| lab-05-cowork | 05 Expert | ~120 min | UltraPlan/UltraReview sur module réel |
