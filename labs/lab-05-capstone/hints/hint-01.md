# Hint 01 — Scoper la mission (règle des 3-5h)

## Le piège : capstone trop ambitieux

Tu vas avoir envie de faire « refactor du module legacy + tests + CI +
documentation ». C'est 3 capstones, pas un. Tu vas finir à 1h du matin
avec une PR à moitié, frustré, et tu n'apprendras rien sur **tes** patterns.

## La règle

**Une mission = un livrable visible en 3-5 heures.**

Si ton archétype prend plus, tu n'as pas scopé — tu as listé.

## Test du livrable

Avant de commencer, formule ton livrable en **une phrase qui contient un
nom commun visible** :

✅ « Un fichier `audit-report.md` qui liste les 10 plus gros risques. »  
✅ « Une PR qui refactore `payment_processor.py` avec tests verts. »  
✅ « Un agent `.claude/agents/test-writer.md` validé sur 3 cas. »  
✅ « Un cron `daily_sync.py` qui tourne 3 jours sans rejouer. »

❌ « Améliorer la qualité du code. »  
❌ « Mettre en place de l'observabilité. »  
❌ « Industrialiser les workflows. »

Si tu ne peux pas pointer le fichier livré à la fin, c'est trop flou.

## Trois critères de succès

Le `mission.md` te demande 3 critères. **Ils doivent être vérifiables sans
toi** — quelqu'un d'autre devrait pouvoir cocher ✅/❌.

✅ « Le fichier `audit-report.md` contient ≥ 8 risques avec sévérité (P0/P1/P2). »  
✅ « `pytest` passe sur le module refactoré. »  
✅ « Le cron a tourné 3 jours et `idempotence.db` contient 3 entrées uniques. »

❌ « Code plus lisible. »  
❌ « Architecture plus propre. »

## Hors scope explicite

Liste **2 choses que tu refuses d'aborder**. C'est la moitié du scoping.

Exemple : « Hors scope : tests d'intégration, CI, doc utilisateur. Si je
trouve un bug dedans, je le note dans un TODO et je continue. »

Sans hors-scope, tu vas dériver.

## Budget temps

Mets un **cap dur** dans `mission.md`. Quand tu l'atteins, tu débriefes —
même si tu n'as pas fini. Le capstone se mesure aussi à ta capacité à
**arrêter** quand le compteur sonne.
