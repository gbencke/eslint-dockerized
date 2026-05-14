#!/usr/bin/env bash
# =============================================================================
# run-tests.sh — Validation suite for the dockerized-eslint image
#
# USAGE
#   ./tests/run-tests.sh [OPTIONS]
#
# OPTIONS
#   -i IMAGE    Docker image name to test (default: dockerized-eslint)
#   -v          Verbose — print full ESLint output for every test case
#   -h          Show this help
#
# EXIT CODE
#   0  All tests passed
#   1  One or more tests failed
#
# HOW IT WORKS
#   Each test mounts the tests/ directory as /data inside the container and
#   runs ESLint against a specific fixture file using the production config
#   mounted at /config/eslint.config.ts.
#
#   PASS tests  expect exit code 0 (no errors; warnings are tolerated).
#   FAIL tests  expect a non-zero exit code AND the target rule name present
#               in the ESLint output.
#
# ADDING NEW TESTS
#   1. Add a fixture under tests/fixtures/pass/ or tests/fixtures/fail/.
#   2. Document the target rule at the top of the file.
#   3. Call expect_pass or expect_fail at the bottom of this script.
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

IMAGE="${ESLINT_IMAGE:-dockerized-eslint}"
VERBOSE=0
PASS_COUNT=0
FAIL_COUNT=0

# Absolute path to the tests/ directory so the docker bind-mount is portable
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colour helpers ────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

pass()    { echo -e "${GREEN}✓ PASS${RESET}  $*"; }
fail()    { echo -e "${RED}✗ FAIL${RESET}  $*"; }
info()    { echo -e "${CYAN}ℹ${RESET}  $*"; }
heading() { echo -e "\n${BOLD}${YELLOW}$*${RESET}"; }

# ── Argument parsing ──────────────────────────────────────────────────────────

while getopts "i:vh" opt; do
  case "$opt" in
    i) IMAGE="$OPTARG" ;;
    v) VERBOSE=1 ;;
    h)
      sed -n '2,/^# ====/p' "$0" | grep '^#' | sed 's/^# \?//'
      exit 0
      ;;
    *) exit 1 ;;
  esac
done

# ── Docker runner ─────────────────────────────────────────────────────────────

run_eslint() {
  # $@ — file paths relative to the tests/ directory
  docker run --rm \
    -v "${TESTS_DIR}:/data" \
    "${IMAGE}" \
    -c /config/eslint.config.ts \
    "$@" 2>&1
}

# ── Test helpers ──────────────────────────────────────────────────────────────

# expect_pass DESCRIPTION FILE
#   Lint FILE and expect exit code 0 (no ESLint errors).
#   Warnings (exit 0) are considered passing — only errors fail.
expect_pass() {
  local description="$1"
  local file="$2"

  output=$(run_eslint "$file" || true)
  exit_code=$(run_eslint "$file" > /dev/null 2>&1; echo $?) || true
  # Re-run capturing exit code reliably
  set +e
  output=$(run_eslint "$file")
  exit_code=$?
  set -e

  if [[ $exit_code -eq 0 ]]; then
    pass "$description"
    (( PASS_COUNT++ )) || true
  else
    fail "$description"
    echo -e "     ${YELLOW}File:${RESET} $file"
    echo -e "     ${YELLOW}Expected:${RESET} exit 0 (no errors)"
    echo -e "     ${YELLOW}Got:${RESET} exit $exit_code"
    echo "$output" | head -30 | sed 's/^/     /'
    (( FAIL_COUNT++ )) || true
  fi

  if [[ $VERBOSE -eq 1 && $exit_code -eq 0 ]]; then
    echo "$output" | sed 's/^/     /'
  fi
}

# expect_fail DESCRIPTION FILE EXPECTED_RULE
#   Lint FILE and expect:
#     1. Exit code != 0  (ESLint found at least one error)
#     2. EXPECTED_RULE appears somewhere in the output
expect_fail() {
  local description="$1"
  local file="$2"
  local expected_rule="$3"

  set +e
  output=$(run_eslint "$file")
  exit_code=$?
  set -e

  local rule_found=0
  echo "$output" | grep -qF "$expected_rule" && rule_found=1

  if [[ $exit_code -ne 0 && $rule_found -eq 1 ]]; then
    pass "$description"
    echo -e "     ${CYAN}Rule triggered:${RESET} $expected_rule"
    (( PASS_COUNT++ )) || true
  else
    fail "$description"
    echo -e "     ${YELLOW}File:${RESET} $file"
    if [[ $exit_code -eq 0 ]]; then
      echo -e "     ${YELLOW}Expected:${RESET} exit != 0 with rule '$expected_rule'"
      echo -e "     ${YELLOW}Got:${RESET} exit 0 — no errors reported at all"
    else
      echo -e "     ${YELLOW}Expected rule:${RESET} $expected_rule"
      echo -e "     ${YELLOW}Got output (first 30 lines):${RESET}"
      echo "$output" | head -30 | sed 's/^/     /'
    fi
    (( FAIL_COUNT++ )) || true
  fi

  if [[ $VERBOSE -eq 1 ]]; then
    echo "$output" | sed 's/^/     /'
  fi
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────

info "Image under test : ${BOLD}${IMAGE}${RESET}"
info "Fixtures directory: ${TESTS_DIR}"
echo ""

if ! docker image inspect "${IMAGE}" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Docker image '${IMAGE}' not found.${RESET}"
  echo "Build it first:  bash build.sh"
  exit 1
fi

# ── PASS tests ────────────────────────────────────────────────────────────────

heading "PASS tests — clean code that must produce zero errors"

expect_pass \
  "Type-system patterns: discriminated unions, satisfies, branded types, unknown" \
  "fixtures/pass/01-clean-typescript.ts"

expect_pass \
  "Functional patterns: const/readonly, pure functions, immutable array ops" \
  "fixtures/pass/02-clean-functional.ts"

expect_pass \
  "Async patterns: awaited promises, Promise.all, .catch() chains" \
  "fixtures/pass/03-clean-promises.ts"

expect_pass \
  "React patterns: functional component, complete hooks deps, alt text" \
  "fixtures/pass/04-clean-react.tsx"

# ── FAIL tests ────────────────────────────────────────────────────────────────

heading "FAIL tests — bad patterns that must trigger the target rule"

expect_fail \
  "Explicit any — @typescript-eslint/no-explicit-any" \
  "fixtures/fail/01-explicit-any.ts" \
  "@typescript-eslint/no-explicit-any"

expect_fail \
  "Floating promise — @typescript-eslint/no-floating-promises" \
  "fixtures/fail/02-floating-promise.ts" \
  "@typescript-eslint/no-floating-promises"

expect_fail \
  "let declaration — functional/no-let" \
  "fixtures/fail/03-no-let.ts" \
  "functional/no-let"

expect_fail \
  "Object/array mutation — functional/immutable-data" \
  "fixtures/fail/04-immutable-data.ts" \
  "functional/immutable-data"

expect_fail \
  "Indexed for loop — unicorn/no-for-loop" \
  "fixtures/fail/05-for-loop.ts" \
  "unicorn/no-for-loop"

expect_fail \
  "Excessive cognitive complexity — sonarjs/cognitive-complexity" \
  "fixtures/fail/06-cognitive-complexity.ts" \
  "sonarjs/cognitive-complexity"

expect_fail \
  "Duplicate function bodies — sonarjs/no-identical-functions" \
  "fixtures/fail/07-duplicate-functions.ts" \
  "sonarjs/no-identical-functions"

expect_fail \
  "Missing JSX key prop — react/jsx-key" \
  "fixtures/fail/08-jsx-key.tsx" \
  "react/jsx-key"

expect_fail \
  "Stale closure from missing useEffect dep — react-hooks/exhaustive-deps" \
  "fixtures/fail/09-exhaustive-deps.tsx" \
  "react-hooks/exhaustive-deps"

expect_fail \
  "img without alt text — jsx-a11y/alt-text" \
  "fixtures/fail/10-missing-alt.tsx" \
  "jsx-a11y/alt-text"

expect_fail \
  "Circular import A→B→A — import-x/no-cycle" \
  "fixtures/fail/11-circular-a.ts" \
  "import-x/no-cycle"

expect_fail \
  "Promise chain without .catch() — promise/catch-or-return" \
  "fixtures/fail/12-promise-chain.ts" \
  "promise/catch-or-return"

# ── Summary ───────────────────────────────────────────────────────────────────

TOTAL=$(( PASS_COUNT + FAIL_COUNT ))
echo ""
echo -e "${BOLD}─────────────────────────────────${RESET}"
echo -e "${BOLD}Results: ${GREEN}${PASS_COUNT} passed${RESET}${BOLD}, ${RED}${FAIL_COUNT} failed${RESET}${BOLD}, ${TOTAL} total${RESET}"
echo -e "${BOLD}─────────────────────────────────${RESET}"

if [[ $FAIL_COUNT -gt 0 ]]; then
  exit 1
fi
