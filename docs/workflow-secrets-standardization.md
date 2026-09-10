# Workflow Secrets Standardization

## Summary

This document outlines the changes needed to standardize secret naming across GitHub workflows and remove non-English comments.

## Changes Required

### 1. Standardize Secret Naming (Issue #276)

**Problem**: Inconsistent secret naming across workflows:

- Some use `secrets.GH_TOKEN` (custom secret)
- Others use `secrets.GITHUB_TOKEN` (built-in)

**Solution**: Standardize to `secrets.GITHUB_TOKEN` for consistency.

**Files to update**:

#### `.github/workflows/OC Architect.yml`

Line 35: Change from:

```yaml
GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

To:

```yaml
GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Line 43: Change from:

```yaml
echo "❌ GH_TOKEN secret is missing"
```

To:

```yaml
echo "❌ GITHUB_TOKEN secret is missing"
```

Line 54: Change from:

```yaml
echo "❌ GH_TOKEN is invalid or expired"
```

To:

```yaml
echo "❌ GITHUB_TOKEN is invalid or expired"
```

#### `.github/workflows/specialists-unified.yml`

Line 260: Change from:

```yaml
GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

To:

```yaml
GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Line 290: Change from:

```yaml
echo "❌ GH_TOKEN secret is missing"
```

To:

```yaml
echo "❌ GITHUB_TOKEN secret is missing"
```

#### `.github/workflows/issue-solver.yml`

Line 31: Change from:

```yaml
GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

To:

```yaml
GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Remove Non-English Comment (Issue #281)

**Problem**: Non-English comment in specialists-unified.yml:

```
"backlog-specialist"      # ← tambah baris ini
```

**Solution**: Remove the comment.

**File**: `.github/workflows/specialists-unified.yml` (line 62)

Change from:

```yaml
'backlog-specialist' # ← tambah baris ini
```

To:

```yaml
'backlog-specialist'
```

## Testing

- [ ] Changes verified locally
- [ ] No breaking changes expected
- [ ] Maintains backward compatibility

## Related Issues

- Closes #276
- Closes #281
- Closes #4413

## Note

These changes cannot be applied via GitHub App due to workflow permission restrictions. Manual application required.
