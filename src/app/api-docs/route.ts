import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export async function GET() {
  const filePath = join(process.cwd(), 'docs/api/openapi.yaml');
  const yaml = await readFile(filePath, 'utf-8');
  return new Response(yaml, {
    status: 200,
    headers: { 'content-type': 'application/yaml; charset=utf-8' },
  });
}
