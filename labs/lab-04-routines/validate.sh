#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
source "$ROOT/../_shared/validate-helpers.sh"
WORK="$ROOT/work"

echo "Lab 04 alt — Routines (cron + webhook + DLQ)"
echo "============================================"

check_file "work/ existe (setup.sh lancé ?)" "$WORK/README.md"

# Structure
check_file "lib/idempotence.py présent" "$WORK/routines/lib/idempotence.py"
check_file "lib/retry.py présent" "$WORK/routines/lib/retry.py"
check_file "lib/dlq.py présent" "$WORK/routines/lib/dlq.py"
check_file "daily_digest.py présent" "$WORK/routines/daily_digest.py"
check_file "webhook.py présent" "$WORK/routines/webhook.py"
check_file "crontab.example présent" "$WORK/crontab.example"
check_file "requirements.txt présent" "$WORK/requirements.txt"

# Heuristiques de qualité
check_contains "idempotence : clé déterministe (sha256 ou md5)" "$WORK/routines/lib/idempotence.py" '(sha256|md5|hashlib)'
check_contains "idempotence : store SQLite" "$WORK/routines/lib/idempotence.py" 'sqlite3'
check_contains "retry : backoff exponentiel" "$WORK/routines/lib/retry.py" '(\*\*|2 \*\*|pow\(2)'
check_contains "retry : jitter (random)" "$WORK/routines/lib/retry.py" 'random'
check_contains "dlq : append JSONL" "$WORK/routines/lib/dlq.py" '(json\.dumps|jsonl|\.write)'
check_contains "webhook : compare_digest (pas ==)" "$WORK/routines/webhook.py" 'compare_digest'
check_contains "webhook : status 401 si HMAC invalide" "$WORK/routines/webhook.py" '401'
check_contains "crontab : entrée @daily ou cron expression" "$WORK/crontab.example" '(@daily|^[0-9]|\*)'

# Tests pytest
if [ -f "$WORK/.venv/bin/pytest" ]; then
  (cd "$WORK" && ./.venv/bin/pytest -q --no-header) > /tmp/lab04r-pytest.log 2>&1
  pytest_exit=$?
  tail -5 /tmp/lab04r-pytest.log
  if [ $pytest_exit -eq 0 ] && grep -Eq '[0-9]+ passed' /tmp/lab04r-pytest.log && ! grep -Eq '[0-9]+ failed' /tmp/lab04r-pytest.log; then
    cm_pass "pytest : tests verts"
  else
    cm_fail "pytest : tests rouges (voir /tmp/lab04r-pytest.log)" ""
  fi
else
  cm_fail ".venv/bin/pytest absent (lance le setup venv + pip install)" ""
fi

report
