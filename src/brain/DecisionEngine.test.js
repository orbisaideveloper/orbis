import { test, expect } from '@jest/globals';
import { DecisionEngine } from './DecisionEngine.js';

test('DecisionEngine should process request and return a valid response', async () => {
  const engine = new DecisionEngine();
  const input = 'Hello ORBIS';
  const result = await engine.processRequest(input);
  
  expect(result).toBeDefined();
  expect(typeof result).toBe('string');
  expect(result.length).toBeGreaterThan(0);
});


