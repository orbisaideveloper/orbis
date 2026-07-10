import { jest } from '@jest/globals';
import { CollaborationHub } from './CollaborationHub.js';

describe('CollaborationHub', () => {
  let hub;

  beforeEach(() => {
    hub = new CollaborationHub();
  });

  test('should create a new collaboration session safely', () => {
    const session = hub.createSession('task-123');
    expect(session.taskId).toBe('task-123');
    expect(session.status).toBe('active');
    expect(session.history).toEqual([]);
  });

  test('should add messages from different providers to a session', () => {
    hub.createSession('task-456');
    
    // Step 1: Provider A does something
    hub.addMessage('task-456', 'openai', 'assistant', 'Initial planning complete.');
    
    // Step 2: Provider B adds to it
    hub.addMessage('task-456', 'gemini', 'assistant', 'Code execution verified.');
    
    const context = hub.getSessionContext('task-456');
    expect(context.length).toBe(2);
    expect(context[0].providerId).toBe('openai');
    expect(context[1].providerId).toBe('gemini');
  });

  test('should throw an error when adding message to non-existent session', () => {
    expect(() => {
      hub.addMessage('invalid-task', 'deepseek', 'user', 'Hello');
    }).toThrow('No active session found');
  });

  test('should close an active session', () => {
    hub.createSession('task-789');
    const closed = hub.closeSession('task-789');
    
    expect(closed).toBe(true);
    expect(() => {
      hub.addMessage('task-789', 'openai', 'assistant', 'Testing closed session');
    }).toThrow('is closed');
  });
});
