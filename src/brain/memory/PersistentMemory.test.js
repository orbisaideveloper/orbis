import { jest } from '@jest/globals';
import { MemoryEngine } from './MemoryEngine.js';
import { MemoryRepository } from './MemoryRepository.js';

describe('STEP 01: Persistent Memory Integration', () => {
  let mockDbClient;
  let repository;
  let engine;

  beforeEach(() => {
    // Mocking Supabase database client
    mockDbClient = {
      from: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { memory_value: 'saved_data' }, error: null })
    };
    
    repository = new MemoryRepository(mockDbClient);
    engine = new MemoryEngine(repository);
  });

  test('should save Project Memory to persistent database', async () => {
    await engine.saveMemory('project', 'status', 'active');
    
    expect(mockDbClient.upsert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'project',
      memory_key: 'status',
      memory_value: 'active'
    }));
  });

  test('should fetch Session Memory from persistent database if not in cache', async () => {
    const result = await engine.getMemory('session', 'token');
    
    expect(result).toBe('saved_data');
    expect(engine.cache.get('session_token')).toBe('saved_data'); // Must be cached after fetch
  });

  test('should work perfectly in memory if database is disconnected', async () => {
    const standaloneEngine = new MemoryEngine(null); // No repository
    await standaloneEngine.saveMemory('conversation', 'last_topic', 'AI');
    
    const result = await standaloneEngine.getMemory('conversation', 'last_topic');
    expect(result).toBe('AI');
  });
});
