import { jest } from '@jest/globals';
import { ProviderOrchestrator } from './ProviderOrchestrator.js';

// একটি ডামি প্রোভাইডার ক্লাস শুধুমাত্র টেস্টিংয়ের জন্য
class DummyProvider {
  async generateResponse() {
    return "Dummy response";
  }
}

describe('ProviderOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new ProviderOrchestrator();
  });

  test('should register and retrieve a provider successfully', () => {
    const dummyProvider = new DummyProvider();
    orchestrator.registerProvider('dummy-ai', dummyProvider);
    
    const retrieved = orchestrator.getProvider('dummy-ai');
    expect(retrieved).toBe(dummyProvider);
  });

  test('should throw error when getting an unregistered provider', () => {
    expect(() => {
      orchestrator.getProvider('unknown-ai');
    }).toThrow("Provider 'unknown-ai' is not registered or loaded.");
  });

  test('should list all registered providers', () => {
    orchestrator.registerProvider('dummy-1', new DummyProvider());
    orchestrator.registerProvider('dummy-2', new DummyProvider());
    
    const list = orchestrator.getAllRegisteredProviders();
    expect(list.length).toBe(2);
    expect(list).toContain('dummy-1');
    expect(list).toContain('dummy-2');
  });

  test('should correctly check if provider exists', () => {
    orchestrator.registerProvider('dummy-ai', new DummyProvider());
    expect(orchestrator.hasProvider('dummy-ai')).toBe(true);
    expect(orchestrator.hasProvider('non-existent')).toBe(false);
  });
});
