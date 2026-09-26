# Weighted Indicators & Domain Taxonomy

Total weighted score: `Σ (subscore.value × weight) / Σ weights` → must be ≥ `TARGET_SCORE_THRESHOLD` (90).

| Indicator ID     | Weight | Target Files                                              | Domain Prefix |
| ---------------- | ------ | --------------------------------------------------------- | ------------- |
| `SEC_AUTH`       | 3      | `src/middleware/*`, `supabase/migrations/*`, RLS policies | `SECURITY_*`  |
| `DATA_INTEGRITY` | 3      | `supabase/schema.sql`, migrations, constraint definitions | `DATA_*`      |
| `ARCH_MOD`       | 2      | `src/components/*`, `src/lib/*`, `src/services/*`         | `ARCH_*`      |
| `UX_CONSISTENCY` | 2      | `src/components/*`, Tailwind classes, responsive layouts  | `UX_*`        |
| `API_CONTRACT`   | 2      | `src/app/api/*`, OpenAPI specs, validation schemas        | `API_*`       |
| `PERF_QUERY`     | 1      | `supabase/migrations/*`, indexed columns, N+1 patterns    | `PERF_*`      |
| `TEST_COVERAGE`  | 1      | `tests/*`, `__tests__/*`, e2e specs                       | `QUALITY_*`   |

> **No-stored-score rule:** An indicator stored in state must not carry a score until its evaluator payload is read and validated. The weighted mean must be recomputable from `subscores`.

## Finding Hash

```text
issue_hash = sha1(file_path | line_range | description).slice(0, 8)
```

Used for: topic branch name (`fix/aok-{domain}-{hash}`), dynamic agent ID, dedup key between evaluator findings and OCR merge.
