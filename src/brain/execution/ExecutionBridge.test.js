import { jest } from '@jest/globals';
import { ExecutionBridge } from './ExecutionBridge.js';

describe('ExecutionBridge', () => {
  let bridge;

  beforeEach(() => {
    bridge = new ExecutionBridge();
  });

  test('should dispatch a task asynchronously and return structured data', async () => {
    const result = await bridge.dispatchToProvider('openai', 'Write a loop', [{ role: 'system', content: 'Be concise' }]);
    
    expect(result.success).toBe(true);
    expect(result.provider).toBe('openai');
    expect(result.contextLength).toBe(1);
    expect(result.data).toContain('Write a loop');
    expect(result.timestamp).toBeDefined();
  });

  test('should throw an error if provider or prompt is missing', async () => {
    // Note: When testing async errors, we must use .rejects
    await expect(bridge.dispatchToProvider('', 'Test prompt'))
      .rejects
      .toThrow('Provider name and prompt are strictly required.');
      
    await expect(bridge.dispatchToProvider('gemini', ''))
      .rejects
      .toThrow('Provider name and prompt are strictly required.');
  });
});
