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
    
    // মেমরিতে একটা নির্দিষ্ট ডেটা সেভ করলাম
    await vector.store('mem-id', 'Secret Python Logic');

    // ঠিক একই শব্দ দিয়ে খুঁজলাম যাতে আমাদের ডামি ভেক্টর ইঞ্জিন সেটা খুঁজে পায়
    const result = await contextEngine.buildContext('task-1', 'Secret Python Logic');

    // চেক করছি যে মেমরিটা প্রম্পটের ভেতর ঠিকমতো ঢুকেছে কি না
    expect(result.finalPrompt).toContain('Secret Python Logic');
    expect(result.finalPrompt).toContain('mem-id'); // মেমরি আইডিও প্রম্পটে থাকা উচিত
    expect(result.contextData.history.length).toBe(1);
  });
});
