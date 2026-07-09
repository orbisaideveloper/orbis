import { DecisionManager } from './DecisionManager.js';

describe('DecisionManager Brick', () => {
  test('should successfully route task through the manager', async () => {
    const manager = new DecisionManager();
    const result = await manager.processRequest('CODING', 'Hello ORBIS');
    
    expect(result).toBeDefined();
    expect(result).toContain('Gemini');
  });
});
