# Hint 02 — Lab 01

Structure suggérée pour `.claude/memory/` :

```
.claude/
└── memory/
    ├── MEMORY.md              # index — une ligne par fichier
    ├── user_profile.md        # qui tu es, ce que tu sais déjà
    └── project_context.md     # contraintes du projet, stack, objectifs
```

Chaque fichier de mémoire typée commence par un frontmatter :

```markdown
---
name: Profil utilisateur
description: Rôle, expertise, préférences
type: user
---
```

`MEMORY.md` est un **index**, pas une mémoire : une ligne par fichier, format `- [Titre](fichier.md) — hook court`.
