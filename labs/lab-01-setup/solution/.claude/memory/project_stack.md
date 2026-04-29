---
name: Stack du projet
description: Node.js ESM minimal — pas de bundler, runner natif node --test
type: project
---

Stack figée pour ce lab :
- Node.js ≥ 20 (`"type": "module"` dans package.json)
- Tests : `node --test src/*.test.js` (runner intégré, pas de Jest/Vitest)
- Pas de bundler (esbuild/vite/webpack), pas de TypeScript

**Why:** Le lab cible la primitive Claude Code "premier projet" — on isole
la valeur ajoutée de l'agent en supprimant tout outillage tiers qui
introduirait du bruit.

**How to apply:** Refuser toute proposition d'introduire un bundler, un test
runner externe ou TypeScript. Si l'utilisateur insiste, lui rappeler que
c'est volontaire et le rediriger vers un autre lab.
