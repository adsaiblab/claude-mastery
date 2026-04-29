#!/usr/bin/env bash
# scripts/validate-all-labs.sh
#
# Lance le validate.sh de chaque lab sur sa SOLUTION canonique.
# Sert de CI : prouve que chaque lab est conçu de telle sorte que sa solution
# de référence passe ses propres checks. Si un lab échoue ici, c'est qu'il y
# a une dérive entre validate.sh et solution/ — à corriger côté lab.
#
# Convention par lab :
#   labs/lab-XX-name/
#     setup.sh        # rm -rf work/ ; cp -R starter/ work/
#     validate.sh     # checks sur work/
#     starter/        # état de départ
#     solution/       # état attendu après résolution
#
# Pour valider la solution, on substitue work/ par une copie de solution/
# avant de lancer validate.sh.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LABS_DIR="$REPO_ROOT/labs"

if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; RESET=''
fi

if [ ! -d "$LABS_DIR" ]; then
  printf "${RED}Aucun dossier labs/ trouvé à %s${RESET}\n" "$LABS_DIR" >&2
  exit 2
fi

# Collecte des labs : tout sous-dossier labs/lab-* qui contient validate.sh.
# Boucle portable bash 3.2 (macOS) — mapfile n'existe pas avant bash 4.
LABS=()
while IFS= read -r line; do
  LABS+=("$line")
done < <(find "$LABS_DIR" -mindepth 1 -maxdepth 1 -type d -name 'lab-*' | sort)

if [ "${#LABS[@]}" -eq 0 ]; then
  printf "${YELLOW}Aucun lab trouvé sous %s${RESET}\n" "$LABS_DIR"
  exit 0
fi

TOTAL=0
PASSED=0
SKIPPED=0
FAILED_LABS=()
SKIPPED_LABS=()

printf "${BOLD}Validation de %d labs (sur leur solution canonique)${RESET}\n" "${#LABS[@]}"
printf "Repo : %s\n\n" "$REPO_ROOT"

for lab_dir in "${LABS[@]}"; do
  lab_name="$(basename "$lab_dir")"
  TOTAL=$((TOTAL + 1))

  printf "${BOLD}${BLUE}━━━ %s ━━━${RESET}\n" "$lab_name"

  if [ ! -x "$lab_dir/validate.sh" ]; then
    printf "${YELLOW}⊙ skip${RESET} — validate.sh manquant ou non exécutable\n\n"
    SKIPPED=$((SKIPPED + 1))
    SKIPPED_LABS+=("$lab_name (no validate.sh)")
    continue
  fi

  if [ ! -d "$lab_dir/solution" ]; then
    printf "${YELLOW}⊙ skip${RESET} — solution/ manquant\n\n"
    SKIPPED=$((SKIPPED + 1))
    SKIPPED_LABS+=("$lab_name (no solution/)")
    continue
  fi

  # Un lab "auto-validable" expose dans solution/ des artefacts canoniques
  # (au-delà du seul EXPLANATION.md). Si ce n'est pas le cas, son canon est
  # purement conceptuel (ex: "rédige un CLAUDE.md") — on saute proprement.
  artifact_count=$(find "$lab_dir/solution" -mindepth 1 -maxdepth 4 ! -name 'EXPLANATION.md' ! -name 'README.md' 2>/dev/null | wc -l | tr -d ' ')
  if [ "$artifact_count" -eq 0 ]; then
    printf "${YELLOW}⊙ skip${RESET} — solution/ ne contient que de la prose (pas d'artefact à valider)\n\n"
    SKIPPED=$((SKIPPED + 1))
    SKIPPED_LABS+=("$lab_name (solution: prose only)")
    continue
  fi

  # Reproduit l'état "lab résolu" : work/ ← copie de solution/.
  rm -rf "$lab_dir/work"
  cp -R "$lab_dir/solution" "$lab_dir/work"

  # Bootstrap optionnel pour labs Python : créer .venv + pip install.
  # Le validate.sh de certains labs (ex: lab-04-routines) attend une venv
  # peuplée avant de lancer pytest.
  if [ -f "$lab_dir/work/requirements.txt" ]; then
    printf "  ${BLUE}↻ bootstrap venv${RESET} (pip install -r requirements.txt)\n"
    (
      cd "$lab_dir/work" || exit 1
      python3 -m venv .venv >/dev/null 2>&1 || { echo "  ↳ python3 -m venv a échoué" >&2; exit 1; }
      ./.venv/bin/pip install --quiet --disable-pip-version-check -r requirements.txt
    ) || printf "  ${YELLOW}↳ bootstrap venv en échec — validate.sh sera quand même exécuté${RESET}\n"
  fi

  # On ne propage pas -e : un lab qui échoue ne doit pas tuer la boucle.
  if (cd "$lab_dir" && bash ./validate.sh); then
    printf "${GREEN}✓ %s${RESET}\n\n" "$lab_name"
    PASSED=$((PASSED + 1))
  else
    printf "${RED}✗ %s${RESET}\n\n" "$lab_name"
    FAILED_LABS+=("$lab_name")
  fi
done

# ────────────── Résumé final ──────────────
echo
printf "${BOLD}══════════════════════════════════════${RESET}\n"
printf "${BOLD}Résumé : %d/%d labs passent${RESET}" "$PASSED" "$TOTAL"
[ "$SKIPPED" -gt 0 ] && printf " (%d skip)" "$SKIPPED"
echo
printf "${BOLD}══════════════════════════════════════${RESET}\n"

if [ "${#SKIPPED_LABS[@]}" -gt 0 ]; then
  printf "${YELLOW}Labs skippés :${RESET}\n"
  for name in "${SKIPPED_LABS[@]}"; do
    printf "  ⊙ %s\n" "$name"
  done
fi

if [ "${#FAILED_LABS[@]}" -gt 0 ]; then
  printf "${RED}Labs en échec :${RESET}\n"
  for name in "${FAILED_LABS[@]}"; do
    printf "  ✗ %s\n" "$name"
  done
  exit 1
fi

if [ "$PASSED" -eq 0 ]; then
  exit 1
fi
exit 0
