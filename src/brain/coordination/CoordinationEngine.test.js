import { jest } from '@jest/globals';
import { CoordinationEngine } from './CoordinationEngine.js';

describe('CoordinationEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new CoordinationEngine();
  });

  test('should execute a task from end-to-end', async () => {
    const result = await engine.executeTask('task-999', 'Write a python script');
    
    // Verify overall execution
    expect(result.taskId).toBe('task-999');
    expect(result.finalStatus).toBe('completed');
    
    // Verify steps were executed by providers
    expect(result.executionResults.length).toBe(3); // Default plan has 3 steps
    expect(result.executionResults[0].provider).toBeDefined();
    
    // Verify collaboration hub recorded the cross-provider messages
    const history = result.contextHistory;
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].role).toBe('system'); // Initial system plan log
  });

  test('should prevent executing with empty task input', async () => {
    await expect(engine.executeTask('task-error', '   ')).rejects.toThrow('Task input cannot be empty.');
  });
});
