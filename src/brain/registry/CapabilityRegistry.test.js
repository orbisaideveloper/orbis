import { CapabilityRegistry } from './CapabilityRegistry.js';

describe('CapabilityRegistry Brick', () => {
  test('should return a provider for CODING task', () => {
    const provider = CapabilityRegistry.getProviderByTask('CODING');
    expect(provider).toBeDefined();
    expect(provider.capabilities).toContain('CODING');
  });
});
