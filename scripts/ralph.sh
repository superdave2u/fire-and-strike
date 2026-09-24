#!/usr/bin/env bash
# Ralph Wiggum loop harness for fire-and-strike.
#
# Usage:
#   scripts/ralph.sh [max_iterations]   # default cap: 25
#
# Stop conditions:
#   - iteration cap reached
#   - .ralph/STOP file exists (graceful stop between iterations)
#   - .ralph/DONE file created by the agent (all IMPLEMENTATION_PLAN tasks checked)
#   - an iteration produces no new commit (no-progress fail-safe)
#
# The agent command defaults to `opencode run`; override with RALPH_AGENT, e.g.:
#   RALPH_AGENT="claude -p" scripts/ralph.sh
set -euo pipefail

CAP="${1:-25}"
AGENT_CMD="${RALPH_AGENT:-opencode run}"

PROMPT='Read README.md, SPEC.md and IMPLEMENTATION_PLAN.md in full before acting.
1. Pick the FIRST unchecked task in IMPLEMENTATION_PLAN.md.
2. Execute it strictly per TDD: write a failing test first, run it to see it fail, then implement the minimum to pass, then refactor.
3. Run the gates with: npm run gates  (lint, typecheck, tests). All must pass.
4. Commit all changes in one conventional commit (feat|fix|test|docs|chore(scope): message), including the ticked checkbox for the completed task in IMPLEMENTATION_PLAN.md.
5. If every task in IMPLEMENTATION_PLAN.md is checked: create .ralph/DONE, commit, and stop making changes.
Never mark a task complete unless its gates pass. Never skip the failing-test-first step. Never start a second task in one iteration.'

mkdir -p .ralph
rm -f .ralph/DONE

for i in $(seq 1 "$CAP"); do
  echo "=== ralph iteration $i/$CAP ==="
  if [ -f .ralph/STOP ]; then
    echo ".ralph/STOP found — halting gracefully."
    break
  fi
  before=$(git rev-parse HEAD)
  # shellcheck disable=SC2086
  $AGENT_CMD "$PROMPT" || echo "warning: agent exited non-zero"
  if [ -f .ralph/DONE ]; then
    echo "IMPLEMENTATION_PLAN complete (.ralph/DONE found) — loop finished."
    break
  fi
  after=$(git rev-parse HEAD)
  if [ "$before" = "$after" ]; then
    echo "No new commit this iteration — stopping (no-progress fail-safe)."
    break
  fi
done

echo "ralph loop finished."