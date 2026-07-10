import { spawn, execSync } from 'child_process';

const BASE_URL = 'http://localhost:3000';

async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log('🧛 BroCula Lighthouse Audit Starting...\n');

  // Start dev server
  console.log('Starting dev server...');
  const server = spawn('npm', ['run', 'dev'], { stdio: 'pipe', shell: true });

  server.stdout.on('data', (data) => {
    if (data.toString().includes('Ready in')) {
      console.log('✓ Dev server ready\n');
    }
  });

  // Wait for server
  const serverReady = await waitForServer(BASE_URL);
  if (!serverReady) {
    console.error('❌ Server failed to start');
    server.kill();
    process.exit(1);
  }

  // Use the existing lighthouse-audit.js script with CHROME_PATH
  console.log('Running Lighthouse audit...\n');

  try {
    const output = execSync(
      'CHROME_PATH=/home/runner/.cache/ms-playwright/chromium-1228/chrome-linux/chrome node scripts/lighthouse-audit.js',
      {
        encoding: 'utf8',
        timeout: 120000,
      }
    );
    console.log(output);
  } catch (err) {
    console.error('Lighthouse audit output:');
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
  }

  server.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
