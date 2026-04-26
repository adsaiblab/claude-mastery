#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"

echo "Lab 05 alt — Capstone (repo perso, freeform)"
echo "============================================="

check_file "work/ existe (setup.sh lancé ?)" "$WORK/mission.md"

# Présence
check_file "mission.md présent" "$WORK/mission.md"
check_file "plan.md présent" "$WORK/plan.md"
check_file "session-log.md présent" "$WORK/session-log.md"
check_file "retrospective.md présent" "$WORK/retrospective.md"

# Non-vide (> 200 octets — i.e. plus que les TODO du template)
check_size() {
  local desc="$1"
  local file="$2"
  local min="$3"
  if [ ! -f "$file" ]; then
    cm_fail "$desc" "fichier manquant"
    return
  fi
  local size
  size=$(wc -c < "$file" | tr -d ' ')
  if [ "$size" -ge "$min" ]; then
    cm_pass "$desc"
  else
    cm_fail "$desc" "taille $size < $min octets — fichier presque vide ?"
  fi
}

check_size "mission.md substantif (> 200 octets)" "$WORK/mission.md" 200
check_size "plan.md substantif (> 300 octets)" "$WORK/plan.md" 300
check_size "session-log.md substantif (> 400 octets)" "$WORK/session-log.md" 400
check_size "retrospective.md substantif (> 300 octets)" "$WORK/retrospective.md" 300

# Sections obligatoires — mission.md
check_contains "mission.md : section ## Repo cible" "$WORK/mission.md" '^## Repo cible'
check_contains "mission.md : section ## Archétype" "$WORK/mission.md" '^## Archétype'
check_contains "mission.md : section ## Critères de succès" "$WORK/mission.md" '^## Critères de succès'

# Détecte qu'un archétype est choisi via la case cochée [x]
check_contains "mission.md : archétype coché ([x])" "$WORK/mission.md" '\- \[[xX]\] \*\*'

# plan.md — au moins 4 étapes numérotées non-TODO
check_contains "plan.md : section ## Étapes" "$WORK/plan.md" '^## Étapes'
check_plan_steps() {
  if [ ! -f "$WORK/plan.md" ]; then
    cm_fail "plan.md : ≥ 4 étapes numérotées non-TODO" "fichier manquant"
    return
  fi
  local count
  # Étapes numérotées qui ne commencent PAS par "N. TODO"
  count=$(grep -cE '^[0-9]+\. [^T]' "$WORK/plan.md" || true)
  if [ "$count" -ge 4 ]; then
    cm_pass "plan.md : $count étapes numérotées non-TODO (≥ 4)"
  else
    cm_fail "plan.md : seulement $count étapes non-TODO (≥ 4 attendues)" ""
  fi
}
check_plan_steps

# retrospective.md — 3 sections obligatoires
check_contains "retrospective.md : section ## Ce qui a marché" "$WORK/retrospective.md" '^## Ce qui a marché'
check_contains "retrospective.md : section ## Ce qui a foiré" "$WORK/retrospective.md" '^## Ce qui a foiré'
check_contains "retrospective.md : section ## À retenir" "$WORK/retrospective.md" '^## À retenir'

# session-log.md — au moins 2 prompts cités non-TODO
check_prompts() {
  if [ ! -f "$WORK/session-log.md" ]; then
    cm_fail "session-log.md : ≥ 2 prompts cités non-TODO" "fichier manquant"
    return
  fi
  # Lignes blockquote `> ...` qui ne contiennent pas TODO
  local quoted
  quoted=$(grep -cE '^> [^T]|^>[^ T]' "$WORK/session-log.md" || true)
  # Blocs ```prompt suivis de contenu non-TODO (best effort)
  local fenced
  fenced=$(awk '/^```prompt/{flag=1; next} /^```$/{flag=0; next} flag && !/^TODO/ && NF' "$WORK/session-log.md" | wc -l | tr -d ' ')
  local total=$((quoted + (fenced > 0 ? 1 : 0)))
  if [ "$total" -ge 2 ]; then
    cm_pass "session-log.md : $total prompts cités non-TODO (≥ 2)"
  else
    cm_fail "session-log.md : seulement $total prompts cités non-TODO (≥ 2 attendus)" ""
  fi
}
check_prompts

# Détection globale : trop de TODO restants → templates non remplis
check_todo_density() {
  local total_todos=0
  for f in mission.md plan.md session-log.md retrospective.md; do
    if [ -f "$WORK/$f" ]; then
      local n
      n=$(grep -cE '\bTODO\b' "$WORK/$f" || true)
      total_todos=$((total_todos + n))
    fi
  done
  # Le starter en contient ~30. La solution ~0. Seuil : 15.
  if [ "$total_todos" -le 15 ]; then
    cm_pass "TODO density : $total_todos restants (≤ 15)"
  else
    cm_fail "TODO density : $total_todos TODO restants (≤ 15 attendus — remplis les templates)" ""
  fi
}
check_todo_density

report
