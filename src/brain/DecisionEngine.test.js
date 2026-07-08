import { test, expect } from '@jest/globals';
import { DecisionEngine } from './DecisionEngine.js';

test('DecisionEngine should process request through provider', async () => {
  const engine = new DecisionEngine();
  const result = await engine.processRequest('Hello');
  expect(result).toContain('ORBIS Engine');
});
