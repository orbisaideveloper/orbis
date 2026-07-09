// CapabilityRegistry.test.js
import { CapabilityRegistry } from './CapabilityRegistry.js';

describe('CapabilityRegistry Brick', () => {
  test('should return a provider for CODING task', () => {
    const provider = CapabilityRegistry.getProviderByTask('CODING');
    expect(provider).toBeDefined();
    expect(provider.capabilities).toContain('CODING');
  });

  test('should return undefined for unsupported task', () => {
    const provider = CapabilityRegistry.getProviderByTask('UNKNOWN_TASK');
    expect(provider).toBeUndefined();
  });
});
