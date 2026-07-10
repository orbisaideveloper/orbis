import { jest } from '@jest/globals';
import { MemoryEngine } from './MemoryEngine.js';

describe('MemoryEngine (Phase 5 Step 02)', () => {
  let memory;

  beforeEach(() => {
    memory = new MemoryEngine();
  });

  test('should strictly separate User Memory and Project Memory', () => {
    // Save personal data
    memory.saveUserDetail('preference', 'explain in simple terms');
    // Save project data
    memory.saveProjectData('orbis-core', { task: 'build API' });

    // Verify isolation
    expect(memory.getUserDetail('preference')).toBe('explain in simple terms');
    expect(memory.getUserDetail('orbis-core')).toBeNull(); // Project ID should not exist in User Memory
    expect(memory.getProjectData('orbis-core').length).toBe(1);
  });

  test('should save and retrieve conversation history accurately', () => {
    memory.saveConversation('user', 'This is a personal diary entry.');
    memory.saveConversation('ai', 'I will remember this forever.');

    const history = memory.getRecentConversations();
    expect(history.length).toBe(2);
    expect(history[0].role).toBe('user');
    expect(history[0].message).toContain('diary');
    expect(history[1].role).toBe('ai');
  });

  test('should throw errors for invalid memory inputs', () => {
    expect(() => {
      memory.saveUserDetail(null, 'value');
    }).toThrow();
    
    expect(() => {
      memory.saveProjectData(null, {});
    }).toThrow();
  });
});
