#!/usr/bin/env bash
# paumen-lint: enforce PAUMEN-UI Coding Contract invariants.
#
# Bans in HTML/JS(X)/TS(X):  <div>, <span>, inline style=, class=
# Bans in HTML/JS(X)/TS(X)/CSS:  !important
#
# Default targets: git-tracked files with known extensions.
# Override: pass paths as arguments.
#   scripts/paumen-lint.sh                  # all tracked files
#   scripts/paumen-lint.sh src/foo.html     # specific files
set -euo pipefail

if [ $# -gt 0 ]; then
  mapfile -t targets < <(printf '%s\n' "$@")
else
  mapfile -t targets < <(git ls-files -- '*.html' '*.htm' '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.css')
fi

html_js=()
all=()
for f in "${targets[@]}"; do
  [ -f "$f" ] || continue
  case "$f" in
    *.html|*.htm|*.js|*.jsx|*.ts|*.tsx|*.mjs) html_js+=("$f"); all+=("$f") ;;
    *.css) all+=("$f") ;;
  esac
done

violations=0

scan() {
  local pattern="$1"; shift
  local files=("$@")
  [ ${#files[@]} -eq 0 ] && return 0
  grep -nHE "$pattern" "${files[@]}" 2>/dev/null || true
}

report() {
  local label="$1" hits="$2"
  [ -z "$hits" ] && return 0
  printf '\n[FAIL] %s\n' "$label"
  printf '%s\n' "$hits" | awk '{print "    " $0}'
  violations=$((violations + $(printf '%s\n' "$hits" | wc -l)))
}

if [ ${#html_js[@]} -gt 0 ]; then
  report '<div> forbidden'         "$(scan '<\/?div\b'                     "${html_js[@]}")"
  report '<span> forbidden'        "$(scan '<\/?span\b'                    "${html_js[@]}")"
  report 'inline style= forbidden' "$(scan '[[:space:]]style[[:space:]]*=' "${html_js[@]}")"
  report 'class= forbidden'        "$(scan '[[:space:]]class[[:space:]]*=' "${html_js[@]}")"
fi

if [ ${#all[@]} -gt 0 ]; then
  report '!important forbidden'    "$(scan '!important'                    "${all[@]}")"
fi

if [ "$violations" -gt 0 ]; then
  printf '\npaumen-lint: %d violation(s)\n' "$violations" >&2
  exit 1
fi

printf 'paumen-lint: clean (%d files scanned)\n' "${#all[@]}"
