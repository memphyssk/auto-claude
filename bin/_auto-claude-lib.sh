#!/usr/bin/env bash
# _auto-claude-lib.sh — shared helpers for auto-claude subcommands.
# Sourced by bin/auto-claude-<subcommand> scripts; never executed directly.

set -o errexit
set -o nounset
set -o pipefail

# ── colors ────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
  readonly C_RED=$'\033[31m'
  readonly C_GREEN=$'\033[32m'
  readonly C_YELLOW=$'\033[33m'
  readonly C_BLUE=$'\033[34m'
  readonly C_BOLD=$'\033[1m'
  readonly C_DIM=$'\033[2m'
  readonly C_RESET=$'\033[0m'
else
  readonly C_RED='' C_GREEN='' C_YELLOW='' C_BLUE='' C_BOLD='' C_DIM='' C_RESET=''
fi

err()  { printf '%s%s%s\n' "$C_RED" "$*" "$C_RESET" >&2; }
warn() { printf '%s%s%s\n' "$C_YELLOW" "$*" "$C_RESET" >&2; }
ok()   { printf '%s%s%s\n' "$C_GREEN" "$*" "$C_RESET"; }
info() { printf '%s%s%s\n' "$C_BLUE" "$*" "$C_RESET"; }
die()  { err "$@"; exit 1; }

# ── project discovery ───────────────────────────────────────────────
# Walk up from $PWD looking for .brainignore. Prints the absolute project root
# path, or exits with error if not found.
find_project_root() {
  local dir="${1:-$PWD}"
  dir=$(cd "$dir" && pwd)
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/.brainignore" ]]; then
      printf '%s' "$dir"
      return 0
    fi
    dir=$(dirname "$dir")
  done
  die "no .brainignore found walking up from $PWD — run 'auto-claude init' first"
}

# ── .brainignore parser ─────────────────────────────────────────────
# Reads .brainignore and populates global arrays. Comments (#) and blanks skipped.
# Syntax:
#   ignore:<path>       → IGNORE_PATHS
#   interactive:<path>  → INTERACTIVE_PATHS
# Trailing slash on <path> means "recursive directory".
parse_brainignore() {
  local file="$1"
  IGNORE_PATHS=()
  INTERACTIVE_PATHS=()
  if [[ ! -f "$file" ]]; then
    return 0
  fi
  while IFS= read -r line; do
    # strip leading/trailing whitespace
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "${line:0:1}" == "#" ]] && continue
    case "$line" in
      ignore:*)      IGNORE_PATHS+=("${line#ignore:}") ;;
      interactive:*) INTERACTIVE_PATHS+=("${line#interactive:}") ;;
      *) warn ".brainignore: unknown mode line: $line" ;;
    esac
  done < "$file"
}

# Returns 0 if $1 matches any pattern in array named $2.
# Pattern syntax: gitignore-style minus negation — prefix match with
# directory semantics when pattern ends in /.
path_matches_any() {
  local path="$1"
  local -n patterns="$2"
  local pat
  for pat in "${patterns[@]}"; do
    if [[ "${pat: -1}" == "/" ]]; then
      # directory pattern — match if path is under this prefix
      if [[ "$path" == "${pat%/}"/* || "$path" == "${pat%/}" ]]; then
        return 0
      fi
    else
      # file pattern — exact match
      [[ "$path" == "$pat" ]] && return 0
    fi
  done
  return 1
}

# ── .brain-version reader/writer ────────────────────────────────────
# .brain-version is a YAML-ish file with `key: value` lines. Parse the value of a key.
brain_version_get() {
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 1
  awk -v k="$key" -F: '
    /^[[:space:]]*#/ || NF<2 {next}
    {
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", $1)
      if ($1 == k) {
        val = $0
        sub(/^[^:]*:[[:space:]]*/, "", val)
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", val)
        print val
        exit
      }
    }
  ' "$file"
}

brain_version_set() {
  local file="$1"
  shift
  # remaining args are key=value pairs
  local tmp
  tmp=$(mktemp)
  cat >"$tmp" <<EOF
# auto-claude brain version pin
# Written by \`auto-claude sync\`. Do not hand-edit unless recovering from sync failure.
#
# Fields:
#   version — semver release tag
#   sha     — exact commit SHA at the pinned version
#   source  — upstream brain repo
#   synced_at — ISO-8601 timestamp of last successful sync

EOF
  local kv k v
  for kv in "$@"; do
    k="${kv%%=*}"
    v="${kv#*=}"
    printf '%s: %s\n' "$k" "$v" >> "$tmp"
  done
  mv "$tmp" "$file"
}

# ── source cache ────────────────────────────────────────────────────
# ~/.cache/auto-claude/source.git — bare mirror of the brain repo.
ensure_source_cache() {
  local source_url="$1"
  local cache_dir="${AUTO_CLAUDE_CACHE:-$HOME/.cache/auto-claude}"
  local mirror="$cache_dir/source.git"
  mkdir -p "$cache_dir"
  if [[ ! -d "$mirror" ]]; then
    info "cloning brain source to $mirror"
    git clone --mirror "$source_url" "$mirror" >/dev/null 2>&1 \
      || die "failed to clone $source_url"
  else
    # fetch only if URL matches (different source = different cache)
    local existing
    existing=$(git --git-dir="$mirror" config --get remote.origin.url)
    if [[ "$existing" != "$source_url" ]]; then
      warn "cache at $mirror points at $existing, not $source_url — clearing"
      rm -rf "$mirror"
      git clone --mirror "$source_url" "$mirror" >/dev/null 2>&1 \
        || die "failed to clone $source_url"
    else
      git --git-dir="$mirror" fetch --all --tags --prune >/dev/null 2>&1 \
        || warn "failed to fetch updates (using stale cache)"
    fi
  fi
  printf '%s' "$mirror"
}

# Resolve a ref (tag, branch, or SHA prefix) to a full SHA in the source mirror.
resolve_ref() {
  local mirror="$1" ref="$2"
  git --git-dir="$mirror" rev-parse --verify "$ref^{commit}" 2>/dev/null
}

# List all files at a given commit (paths relative to the brain repo root).
list_files_at_ref() {
  local mirror="$1" sha="$2"
  git --git-dir="$mirror" ls-tree -r --name-only "$sha"
}

# Read a file's content at a given commit.
show_file_at_ref() {
  local mirror="$1" sha="$2" path="$3"
  git --git-dir="$mirror" show "$sha:$path" 2>/dev/null
}

# ── file classification ─────────────────────────────────────────────
# Output: one of UNCHANGED NEW REMOVED IGNORE OVERWRITE INTERACTIVE CONFLICT
#
# Arguments:
#   mirror      — source git dir
#   pinned_sha  — currently pinned brain SHA
#   target_sha  — target brain SHA
#   path        — brain-relative path
#   project_dir — consumer project root
#   snapshot_dir — consumer .brain-snapshot/ root (under project/command-center/)
classify_file() {
  local mirror="$1" pinned_sha="$2" target_sha="$3" path="$4" project_dir="$5" snapshot_dir="$6"

  # ignore mode wins regardless of anything else
  if path_matches_any "$path" IGNORE_PATHS; then
    printf 'IGNORE'
    return
  fi

  local base_pinned base_target
  base_pinned=$(show_file_at_ref "$mirror" "$pinned_sha" "$path" || true)
  base_target=$(show_file_at_ref "$mirror" "$target_sha" "$path" || true)

  # file didn't exist at pinned — net-new
  if [[ -z "$base_pinned" ]] && ! git --git-dir="$mirror" cat-file -e "$pinned_sha:$path" 2>/dev/null; then
    printf 'NEW'
    return
  fi

  # file doesn't exist at target — removed upstream
  if [[ -z "$base_target" ]] && ! git --git-dir="$mirror" cat-file -e "$target_sha:$path" 2>/dev/null; then
    printf 'REMOVED'
    return
  fi

  # brain didn't change this file between pinned and target
  if [[ "$base_pinned" == "$base_target" ]]; then
    printf 'UNCHANGED'
    return
  fi

  # interactive mode — check for project-side changes that might conflict
  if path_matches_any "$path" INTERACTIVE_PATHS; then
    local project_current
    if [[ -f "$project_dir/$path" ]]; then
      project_current=$(cat "$project_dir/$path")
    else
      project_current=""
    fi
    # project hasn't changed from pinned — interactive-but-clean
    if [[ "$project_current" == "$base_pinned" ]]; then
      printf 'INTERACTIVE'
      return
    fi
    # both sides changed — conflict
    printf 'CONFLICT'
    return
  fi

  # default mode — overwrite
  printf 'OVERWRITE'
}

# ── 3-way merge using git ────────────────────────────────────────────
# Writes three files and runs `git merge-file` which writes the result into $merged.
# Returns 0 on clean merge, 1 on conflicts (file still gets written with conflict markers).
three_way_merge() {
  local base_pinned_content="$1" base_target_content="$2" project_current_content="$3" merged_path="$4"
  local tmpdir
  tmpdir=$(mktemp -d)
  printf '%s' "$base_pinned_content"     > "$tmpdir/base"
  printf '%s' "$base_target_content"     > "$tmpdir/target"
  printf '%s' "$project_current_content" > "$tmpdir/current"
  # --ours = project_current; --theirs = brain's new version. Base is the common ancestor.
  local rc=0
  cp "$tmpdir/current" "$merged_path"
  git merge-file -L project -L pinned -L brain-target "$merged_path" "$tmpdir/base" "$tmpdir/target" || rc=$?
  rm -rf "$tmpdir"
  return $rc
}
