import { jest } from '@jest/globals';
import { MultiAICollaboration } from './MultiAICollaboration.js';

describe('MultiAICollaboration (Step 05 Fix)', () => {
  let collaborationEngine;
  let mockRegistry;
  let mockContextEngine;

  beforeEach(() => {
    // 1. Mocking the Registry and Adapters safely
    mockRegistry = {
      getProvider: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue({
          data: '[Real Integration Ready] AI processed this step.'
        })
      })
    };
    
    // 2. Mocking Context Engine
    mockContextEngine = {
      buildContext: jest.fn().mockResolvedValue({
        finalPrompt: 'Initial context for the task'
      })
    };

    collaborationEngine = new MultiAICollaboration(mockRegistry, mockContextEngine);
  });

  test('should execute team workflow sequentially without bridge errors', async () => {
    const result = await collaborationEngine.runWorkflow('task-1', 'Build a simple API');
    
    expect(result.status).toBe('success');
    expect(result.workflowTrace.length).toBe(3);
    
    // Verify roles executed in correct order
    expect(result.workflowTrace[0].role).toBe('planner');
    expect(result.workflowTrace[1].role).toBe('coder');
    expect(result.workflowTrace[2].role).toBe('reviewer');
    
    expect(result.finalOutput).toContain('[Real Integration Ready]');
  });
});
