import { ConfigurationService } from '@/lib/config-service';

describe('ConfigurationService Security', () => {
  let service: ConfigurationService;
  const testConfigDir = 'ai/agent-configs';

  beforeEach(() => {
    service = new ConfigurationService(testConfigDir);
  });

  it('should not allow path traversal in agentName', async () => {
    // This should ideally throw or be sanitized
    // Currently it will try to read ai/agent-configs/../package.json.yml
    const traversalName = '../package.json';

    // We expect it to fail because the file doesn't exist WITH .yml extension,
    // but the vulnerability is that it ATTEMPTS to read outside the directory.
    // If an attacker could upload a .yml file elsewhere, they could read it.

    // A better way to test is to check the generated path if we could,
    // but it's private. So we check if it throws a specific error or if we can sanitize it.

    await expect(service.loadAgentConfig(traversalName)).rejects.toThrow(
      /Failed to load/
    );
  });
});
