import { jest } from '@jest/globals';
import { ContextEngine } from './ContextEngine.js';
import { MemoryInterface } from '../memory/MemoryInterface.js';

describe('ContextEngine', () => {
  let contextEngine;
  let memoryInterface;

  beforeEach(() => {
    contextEngine = new ContextEngine();
    memoryInterface = new MemoryInterface();
  });

  test('should combine memory and task context successfully', () => {
    // মেমরিতে কিছু ডামি ডেটা সেট করা হচ্ছে
    memoryInterface.setUserContext('theme', 'dark');
    memoryInterface.setProjectContext('projectId', 'ORBIS-PHASE-3');
    memoryInterface.addConversation('user', 'Hello ORBIS');

    // কনটেক্সট ইঞ্জিন দিয়ে ডেটা কম্বাইন করা হচ্ছে
    const enrichedContext = contextEngine.buildContext(memoryInterface, 'Analyze this code');

    // টেস্ট করা হচ্ছে যে ডেটাগুলো ঠিকমতো কম্বাইন হয়েছে কি না
    expect(enrichedContext.task).toBe('Analyze this code');
    expect(enrichedContext.environment.theme).toBe('dark');
    expect(enrichedContext.environment.projectId).toBe('ORBIS-PHASE-3');
    expect(enrichedContext.history.length).toBe(1);
    expect(enrichedContext.history[0].message).toBe('Hello ORBIS');
    expect(enrichedContext.timestamp).toBeDefined();
  });
});
