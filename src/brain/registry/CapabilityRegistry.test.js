import { jest } from '@jest/globals';
import { CapabilityRegistry } from './CapabilityRegistry.js';

describe('CapabilityRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new CapabilityRegistry();
  });

  test('should initialize with predefined providers', () => {
    const providers = registry.getAllProviders();
    expect(providers.length).toBeGreaterThan(0);
    expect(registry.providers.openai).toBeDefined();
    expect(registry.providers.gemini).toBeDefined();
    expect(registry.providers.claude).toBeDefined();
  });

  test('should find a provider by task type', () => {
    const codingProvider = registry.getProviderByTask('CODING');
    expect(codingProvider).toBeDefined();
    expect(codingProvider.capabilities).toContain('CODING');
  });

  test('should return null for unknown task type', () => {
    const unknownProvider = registry.getProviderByTask('UNKNOWN_TASK');
    expect(unknownProvider).toBeNull();
  });
});
