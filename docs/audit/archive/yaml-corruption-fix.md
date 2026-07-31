# YAML Corruption Fix for test-unified-workflow.yml

## Issue

GitHub Issue #2844: The file `.github/workflows/test-unified-workflow.yml` is corrupted with XML-like tags at the end.

## Problem Description

The workflow file has the following corrupted lines appended at the end:

```yaml
content>
<line_count>207</line_count>
</write_to_file>
```

These lines are not valid YAML and cause the YAML parser to fail with:

```
yaml.scanner.ScannerError: while scanning a simple key
  in "/path/to/.github/workflows/test-unified-workflow.yml", line 308, column 1
could not find expected ':'
  in "/path/to/.github/workflows/test-unified-workflow.yml", line 309, column 1
```

## Impact

- CI workflow validation fails
- YAML parser throws syntax errors
- Workflow cannot be executed

## Fix

Remove the corrupted lines from the end of the file. The file should end with:

```yaml
env:
  GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Verification

After applying the fix, validate the YAML:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/test-unified-workflow.yml')); print('YAML is valid')"
```

## Why This Fix Couldn't Be Applied Automatically

The GitHub App token used for automation doesn't have the `workflows` permission required to modify workflow files. This is a security restriction in GitHub Actions.

## Manual Fix Instructions

1. Open `.github/workflows/test-unified-workflow.yml`
2. Scroll to the end of the file (around line 308)
3. Remove the following lines:
   ```
   content>
   <line_count>207</line_count>
   </write_to_file>
   ```
4. Save the file
5. Validate the YAML using the command above
6. Commit and push the changes

## Related Issues

- Issue #2844: fix: corrupted YAML in test-unified-workflow.yml
