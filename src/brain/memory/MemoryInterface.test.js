import { jest } from '@jest/globals';
import { MemoryInterface } from './MemoryInterface.js';

describe('MemoryInterface', () => {
  let memoryInterface;

  beforeEach(() => {
    memoryInterface = new MemoryInterface();
  });

  test('should store and retrieve user context', () => {
    memoryInterface.setUserContext('theme', 'dark');
    expect(memoryInterface.getUserContext('theme')).toBe('dark');
  });

  test('should add and retrieve conversation history', () => {
    memoryInterface.addConversation('user', 'Hello ORBIS');
    const history = memoryInterface.getConversationHistory();
    
    expect(history.length).toBe(1);
    expect(history[0].role).toBe('user');
    expect(history[0].message).toBe('Hello ORBIS');
    expect(history[0].timestamp).toBeDefined();
  });

  test('should store and retrieve project context', () => {
    memoryInterface.setProjectContext('projectId', 'ORBIS-PHASE-3');
    expect(memoryInterface.getProjectContext('projectId')).toBe('ORBIS-PHASE-3');
  });

  test('should manage session memory correctly', () => {
    memoryInterface.setSessionMemory('activeTask', 'coding');
    expect(memoryInterface.getSessionMemory('activeTask')).toBe('coding');
    
    memoryInterface.clearSession();
    expect(memoryInterface.getSessionMemory('activeTask')).toBeUndefined();
  });
});
