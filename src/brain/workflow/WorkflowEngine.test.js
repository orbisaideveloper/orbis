import { jest } from '@jest/globals';
import { WorkflowEngine } from './WorkflowEngine.js';

describe('WorkflowEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new WorkflowEngine();
  });

  test('should execute a multi-step workflow sequentially', async () => {
    // একটি ডামি ওয়ার্কফ্লো প্ল্যান তৈরি করা হলো
    const steps = [
      { name: 'Planning', agent: 'GENERAL' },
      { name: 'Coding', agent: 'CODING' },
      { name: 'Review', agent: 'ANALYSIS' }
    ];

    const results = await engine.executeWorkflow('orbis-test-workflow', steps);

    // টেস্ট করা হচ্ছে যে ৩টি ধাপই ঠিকমতো কাজ করেছে কি না
    expect(results.length).toBe(3);
    expect(results[0].step).toBe('Planning');
    expect(results[1].step).toBe('Coding');
    expect(results[2].step).toBe('Review');
    expect(results[0].status).toBe('success');
  });
});
