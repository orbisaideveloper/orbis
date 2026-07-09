import { DecisionManager } from './DecisionManager.js';

test('manager works', async () => {
  const manager = new DecisionManager();
  const res = await manager.processRequest('CODING', 'Hi');
  expect(res).toBeDefined();
});
