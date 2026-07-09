// src/brain/decision/DecisionManager.test.js
import DecisionManager from './DecisionManager.js';

describe('DecisionManager', () => {
  let dm;

  beforeEach(() => {
    dm = new DecisionManager();
  });

  test('should register and retrieve a provider for a task', () => {
    const mockProvider = { name: 'TestProvider' };
    dm.registerDecision('CODING', mockProvider);
    
    const provider = dm.getDecision('CODING');
    expect(provider).toBeDefined();
    expect(provider.name).toBe('TestProvider');
  });

  test('should return undefined for unregistered task', () => {
    const provider = dm.getDecision('UNKNOWN_TASK');
    expect(provider).toBeUndefined();
  });
});
