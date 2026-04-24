#!/usr/bin/env bash
# Helpers partagés par tous les validate.sh. Sourcer au début du script.
#
#   source "$(dirname "$0")/../_shared/validate-helpers.sh"
#
# API :
#   check "Description"        "<commande>"   # exit 0 attendu
#   check_fail "Description"   "<commande>"   # exit != 0 attendu
#   check_contains "Desc" <fichier> "<motif>"
#   report                                    # affiche le résumé et exit

set -u

if [ -t 1 ]; then
  CM_RED='\033[0;31m'
  CM_GREEN='\033[0;32m'
  CM_YELLOW='\033[0;33m'
  CM_BOLD='\033[1m'
  CM_RESET='\033[0m'
else
  CM_RED=''; CM_GREEN=''; CM_YELLOW=''; CM_BOLD=''; CM_RESET=''
fi

CM_PASS=0
CM_FAIL=0
CM_FAILED_NAMES=()

cm_pass() {
  printf "  ${CM_GREEN}✓${CM_RESET} %s\n" "$1"
  CM_PASS=$((CM_PASS + 1))
}

cm_fail() {
  printf "  ${CM_RED}✗${CM_RESET} %s\n" "$1"
  if [ -n "${2-}" ]; then
    printf "    ${CM_YELLOW}↳${CM_RESET} %s\n" "$2"
  fi
  CM_FAIL=$((CM_FAIL + 1))
  CM_FAILED_NAMES+=("$1")
}

check() {
  local desc="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    cm_pass "$desc"
  else
    cm_fail "$desc" "commande échouée : $cmd"
  fi
}

check_fail() {
  local desc="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    cm_fail "$desc" "commande aurait dû échouer : $cmd"
  else
    cm_pass "$desc"
  fi
}

check_contains() {
  local desc="$1"
  local file="$2"
  local pattern="$3"
  if [ ! -f "$file" ]; then
    cm_fail "$desc" "fichier introuvable : $file"
    return
  fi
  if grep -qE "$pattern" "$file"; then
    cm_pass "$desc"
  else
    cm_fail "$desc" "motif absent de $file : $pattern"
  fi
}

check_file() {
  local desc="$1"
  local file="$2"
  if [ -f "$file" ]; then cm_pass "$desc"; else cm_fail "$desc" "fichier manquant : $file"; fi
}

check_executable() {
  local desc="$1"
  local file="$2"
  if [ -x "$file" ]; then cm_pass "$desc"; else cm_fail "$desc" "non exécutable : $file"; fi
}

report() {
  local total=$((CM_PASS + CM_FAIL))
  echo
  if [ "$CM_FAIL" -eq 0 ]; then
    printf "${CM_GREEN}${CM_BOLD}✓ Lab validé — %d/%d checks passent.${CM_RESET}\n" "$CM_PASS" "$total"
    exit 0
  else
    printf "${CM_RED}${CM_BOLD}✗ Lab incomplet — %d/%d checks passent.${CM_RESET}\n" "$CM_PASS" "$total"
    printf "${CM_YELLOW}Checks échoués :${CM_RESET}\n"
    for name in "${CM_FAILED_NAMES[@]}"; do
      printf "  • %s\n" "$name"
    done
    exit 1
  fi
}
