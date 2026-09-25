/**
 * Regression test for #4459: CREATE POLICY IF NOT EXISTS is invalid Postgres.
 * Fresh-apply of supabase/migrations must use DROP IF EXISTS + CREATE.
 */
import fs from 'fs';
import path from 'path';
function resolveMigrationsDir(): string {
  const candidates = [
    path.join(__dirname, '..', 'supabase', 'migrations'),
    path.join(process.cwd(), 'supabase', 'migrations'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return MIGRATIONS_DIR;
}

describe('#4459 migration policy idempotency', () => {
  it('no migration uses CREATE POLICY IF NOT EXISTS', () => {
    const dir = resolveMigrationsDir();
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'));
    expect(files.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const f of files) {
      const sql = fs.readFileSync(path.join(dir, f), 'utf8');
      if (/CREATE\s+POLICY\s+IF\s+NOT\s+EXISTS/i.test(sql)) {
        offenders.push(f);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('003_vectors_pgvector_support.sql uses DROP+CREATE for service-role policy', () => {
    const dir = resolveMigrationsDir();
    const sql = fs.readFileSync(
      path.join(dir, '003_vectors_pgvector_support.sql'),
      'utf8'
    );
    expect(sql).toMatch(
      /DROP POLICY IF EXISTS "Service role can update vectors"/
    );
    expect(sql).toMatch(/CREATE POLICY "Service role can update vectors"/);
  });
});
