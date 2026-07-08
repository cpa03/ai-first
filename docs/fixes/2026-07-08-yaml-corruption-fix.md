# YAML Corruption Fix - Issue #2844

## Problem

The file `.github/workflows/test-unified-workflow.yml` is corrupted with XML-like tags at the end (lines 308-310):

```yaml
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
content>
<line_count>207</line_count>
</write_to_file>
```

## Impact

- CI workflow validation fails
- YAML parser throws syntax errors
- Workflow cannot be executed

## Solution

Remove the corrupted lines (308-310) from the file.

## Manual Fix Instructions

Since the GitHub App doesn't have workflow permissions, a maintainer needs to:

1. Open `.github/workflows/test-unified-workflow.yml`
2. Delete lines 308-310 (the XML-like tags)
3. Save the file
4. Commit and push

## Verification

After the fix, run:

```bash
cat .github/workflows/test-unified-workflow.yml | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin); print('YAML is valid')"
```

## Related

- Issue: #2844
- Agent: BugFixer
- Date: 2026-07-08
