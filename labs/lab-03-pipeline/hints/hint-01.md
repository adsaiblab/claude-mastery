# Hint 01 — Lab 03

Pense chaque subagent comme un **travailleur avec un seul outil**. Si tu hésites à mettre un tool, ne le mets pas. Principe de moindre privilège.

Pour chaîner : le résultat d'un subagent devient l'input du suivant via un fichier intermédiaire (`plan.md`, `test-report.md`, `judge-verdict.json`). L'orchestrateur principal (la slash-command) lit et passe ces artefacts.
