---
name: Convention tests-first
description: Toujours écrire le test avant l'implémentation pour ce projet
type: feedback
---

Pour toute nouvelle fonction exportée, créer son fichier `*.test.js` AVANT
l'implémentation.

**Why:** Le projet est volontairement minimaliste pour servir de support
pédagogique — la discipline tests-first évite les régressions silencieuses
quand l'apprenant compose des features.

**How to apply:** Si une demande arrive sans test associé, proposer le test
en premier patch puis l'implémentation en second. Refuser poliment une
implémentation "sans test, on verra plus tard".
