# Preflight Gate — 10 Checks (Run Once, Before STATE 0)

**Goal:** Fail fast with zero side effects. Record every result under `state.preflight` in `orchestrator_state.json`.

> If any check fails: **ABORT exit 1**, emit the Abort section in the final report, do not create issues, do not make branches.

---

## Check 1 — Git worktree + `origin` remote

```bash
git rev-parse --is-inside-work-tree && git remote get-url origin
```

**Fail:** `ABORT exit 1: "not a git repo with origin"`

---

## Check 2 — `gh` present + authenticated

```bash
command -v gh && gh auth status
```

**Fail:** `ABORT exit 1: "run \`gh auth login\`"`

---

## Check 3 — `opencode` present (spawn engine)

```bash
command -v opencode
```

**Fail:** `ABORT exit 1: "opencode CLI not installed"`

---

## Check 4 — `timeout` present (TTL enforcement)

```bash
command -v timeout
```

**Fail:** `ABORT exit 1: "timeout command not found (required for TTL enforcement)"`

---

## Check 5 — `ocr` present

```bash
command -v ocr
```

If missing:

```bash
npm install -g @alibaba-group/open-code-review
```

Then re-check. Install fails → `ABORT exit 1: "ocr install failed"`

---

## Check 6 — `ocr` supports `--output`

```bash
ocr review --help | grep -q -- '--output'
```

**Fail:** Unknown flag → **ask the user** whether to upgrade:

```
npm i -g @alibaba-group/open-code-review@latest
```

**Wait for the answer** before proceeding (skill rule: never upgrade blindly).

---

## Check 7 — OCR LLM provider reachable

```bash
timeout 60 ocr llm test
```

**Fail:** `ABORT exit 1: "LLM provider unreachable — run \`ocr config provider\`"`

> Never invent keys, never retry blindly. The skill's Troubleshooting maps error → fix; provider passed preflight, so a later failure means the provider went down.

---

## Check 8 — Skills dir readable

```bash
ls ~/.agents/skills/ | grep -q 'open-code-review'
```

**Fail:** `ABORT exit 1: "skill 'open-code-review' not found; AOK-GH requires it"`

---

## Check 9 — `.agent_memory/` writable

```bash
mkdir -p .agent_memory/payloads
```

**Fail:** `ABORT exit 1: "cannot create .agent_memory/payloads"`

---

## Check 10 — Target branch exists on origin

```bash
git ls-remote --heads origin ${TARGET_BRANCH}
```

**Fail:** `ABORT exit 1: "TARGET_BRANCH '${TARGET_BRANCH}' not pushed to origin"`

---

## Success Output

When **all 10 pass**, emit exactly one line:

```
PREFLIGHT OK (ocr v1.12.9, gh authenticated, opencode present)
```

Then proceed to STATE 0.
