# Hint 02 — Lab 03

Matrice tools :

| Subagent | Tools |
|----------|-------|
| explorer | Read, Grep, Glob |
| planner | Read, Grep, Glob |
| implementer | Read, Edit, Write, Bash |
| tester | Read, Bash |
| judge | Read, Grep |

Le hook `Stop` lit `judge-verdict.json` à la racine, en extrait `.score`, et si < 7 : relance via `exit 2` avec un message expliquant ce qui cloche (le message passe dans le prompt suivant de Claude).
