import { VectorEngine } from './VectorEngine.js';

describe('VectorEngine (Step 03)', () => {
  let engine;

  beforeEach(() => {
    engine = new VectorEngine();
  });

  test('should store and retrieve memories semantically', async () => {
    await engine.store('mem-1', 'My calculation result was 500');
    await engine.store('mem-2', 'The meeting is at 10 AM');

    // Retrieve via semantic similarity (approximate)
    const results = await engine.retrieve('calculation result');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text).toBe('My calculation result was 500');
  });

  test('should not hang on empty search', async () => {
    const results = await engine.retrieve('random query');
    expect(results).toEqual([]);
  });
});
