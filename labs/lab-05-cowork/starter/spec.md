# Spec — module de rate-limiting par IP

Feature à implémenter dans `module-sample/` :

Un middleware qui limite les requêtes à **100 par minute par IP**, avec :
- compteur en mémoire (pas de Redis pour le starter),
- fenêtre glissante (pas fixe),
- header de réponse `X-RateLimit-Remaining`,
- `429 Too Many Requests` avec `Retry-After` au-delà du seuil,
- libération de la mémoire pour les IPs inactives depuis > 5 minutes.

Tests fournis dans `module-sample/test/rate-limit.test.js` doivent passer.
