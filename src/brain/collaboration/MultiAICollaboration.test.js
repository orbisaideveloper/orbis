import { jest } from '@jest/globals';
import { MultiAICollaboration } from './MultiAICollaboration.js';
import { ProviderRegistry } from '../registry/ProviderRegistry.js';
import { ExecutionBridge } from '../execution/ExecutionBridge.js';
import { OpenAIProvider } from '../providers/OpenAIProvider.js';
import { GeminiProvider } from '../providers/GeminiProvider.js';

describe('MultiAICollaboration (Step 05)', () => {
  let collaborationEngine;
  let registry;
  let bridge;
  let mockContextEngine;

  beforeEach(() => {
    registry = new ProviderRegistry();
    // Using dummy keys for tests (as required since Step 01)
    registry.registerProvider(new OpenAIProvider('dummy-key-1'));
    registry.registerProvider(new GeminiProvider('dummy-key-2'));
    
    bridge = new ExecutionBridge();
    
    // Mocking the Context Engine
    mockContextEngine = {
      buildContext: jest.fn().mockResolvedValue({
        finalPrompt: 'Initial user request context'
      })
    };

    collaborationEngine = new MultiAICollaboration(registry, bridge, mockContextEngine);
  });

  test('should execute a multi-agent workflow sequentially', async () => {
    const result = await collaborationEngine.runWorkflow('task-100', 'Build a login system');
    
    expect(result.status).toBe('success');
    expect(result.workflowTrace.length).toBe(3);
    
    // Verify roles executed in order
    expect(result.workflowTrace[0].role).toBe('planner');
    expect(result.workflowTrace[1].role).toBe('coder');
    expect(result.workflowTrace[2].role).toBe('reviewer');
    
    // Verify AI passing data
    expect(result.finalOutput).toContain('[Real Integration Ready]');
  });
});
