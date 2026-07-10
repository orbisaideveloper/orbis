import { jest } from '@jest/globals';
import { ExecutionBridge } from './ExecutionBridge.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';

describe('ExecutionBridge', () => {
  let bridge;

  beforeEach(() => {
    bridge = new ExecutionBridge();
  });

  test('should dispatch a task using a Provider Adapter', async () => {
    const mockAdapter = new OpenAIProvider();
    const result = await bridge.dispatch(mockAdapter, 'Write a loop');
    
    expect(result.success).toBe(true);
    expect(result.provider).toBe('openai');
    expect(result.data).toContain('Write a loop');
  });

  test('should throw an error if provider adapter is invalid or missing', async () => {
    await expect(bridge.dispatch(null, 'Test prompt'))
      .rejects
      .toThrow('A valid Provider Adapter is strictly required.');
  });
});
