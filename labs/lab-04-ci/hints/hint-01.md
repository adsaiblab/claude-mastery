# Hint 01 — Lab 04

Le workflow a besoin de 3 permissions :

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
```

Sans `pull-requests: write`, le commentaire silent-fail.
