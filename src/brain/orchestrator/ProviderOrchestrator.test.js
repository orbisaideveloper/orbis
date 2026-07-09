import { DecisionManager } from './DecisionManager.js';

describe('DecisionManager', () => {
  test('should process request', async () => {
    const manager = new DecisionManager();
    const result = await manager.processRequest('CODING', 'Test');
    expect(result).toBeDefined();
  });
});
