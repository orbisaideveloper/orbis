import { jest } from '@jest/globals';
import { ContextEngine } from './ContextEngine.js';
import { MemoryEngine } from '../memory/MemoryEngine.js';
import { VectorEngine } from '../memory/VectorEngine.js';

describe('ContextIntelligenceEngine (Step 04)', () => {
  let contextEngine;
  let memory;
  let vector;

  beforeEach(() => {
    memory = new MemoryEngine();
    vector = new VectorEngine();
    contextEngine = new ContextEngine(memory, vector);
  });

  test('should aggregate context from memory and vector engines', async () => {
    // Setup dummy data
    memory.saveConversation('user', 'Hello');
    await vector.store('mem-id', 'User likes Python');

    const result = await contextEngine.buildContext('task-1', 'Write code');

    expect(result.finalPrompt).toContain('Write code');
    expect(result.finalPrompt).toContain('User likes Python');
    expect(result.contextData.history.length).toBe(1);
  });
});
