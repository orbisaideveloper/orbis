import { jest } from '@jest/globals';
import { DecisionManager } from './DecisionManager.js';

describe('DecisionManager', () => {
  let decisionManager;

  beforeEach(() => {
    decisionManager = new DecisionManager();
  });

  test('should select correct provider for CODING task', () => {
    const provider = decisionManager.evaluateTask('CODING');
    expect(provider).toBeDefined();
    expect(provider.capabilities).toContain('CODING');
  });

  test('should select correct provider for MULTIMODAL task', () => {
    const provider = decisionManager.evaluateTask('MULTIMODAL');
    expect(provider).toBeDefined();
    expect(provider.capabilities).toContain('MULTIMODAL');
  });

  test('should fallback to GENERAL provider if task is unknown', () => {
    const provider = decisionManager.evaluateTask('UNKNOWN_WEIRD_TASK');
    expect(provider).toBeDefined();
    expect(provider.capabilities).toContain('GENERAL');
  });
});
