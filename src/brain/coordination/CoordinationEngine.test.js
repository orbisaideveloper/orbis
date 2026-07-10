import { jest } from '@jest/globals';
import { CoordinationEngine } from './CoordinationEngine.js';

describe('CoordinationEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new CoordinationEngine();
  });

  test('should execute a task end-to-end using dynamic registry and adapters', async () => {
    const result = await engine.executeTask('task-999', 'Analyze the data');
    
    // Verify overall execution
    expect(result.taskId).toBe('task-999');
    expect(result.finalStatus).toBe('completed');
    
    // Verify steps were executed by mapped capabilities
    expect(result.executionResults.length).toBe(2); 
    // step 1 (Gather Data) -> data_processing -> gemini
    expect(result.executionResults[0].result).toContain('[Mock Gemini Adapter]');
    // step 2 (Analyze Data) -> analytical_reasoning -> openai
    expect(result.executionResults[1].result).toContain('[Mock OpenAI Adapter]');
  });
});
