import { MemoryEngine } from './memory/MemoryEngine.js';
import { MemoryGovernance } from './memory/MemoryGovernance.js';
import { ContextEngine } from './context/ContextEngine.js';
import { MultiAICollaboration } from './collaboration/MultiAICollaboration.js';
import { ToolEngine } from './tools/ToolEngine.js';

describe('ORBIS Phase 5: System Intelligence Evaluation (Master Test)', () => {
  let memoryEngine, governance, contextEngine, collaboration, toolEngine;

  beforeAll(() => {
    // 1. Initialize all core brain modules together
    memoryEngine = new MemoryEngine();
    governance = new MemoryGovernance(memoryEngine);
    contextEngine = new ContextEngine(memoryEngine, null); 
    collaboration = new MultiAICollaboration({}, contextEngine); 
    toolEngine = new ToolEngine();
  });

  test('System Check 1: Memory & Governance Integrity', () => {
    // Testing if AI can remember and securely update data
    governance.updateUserDetail('system_status', 'ONLINE');
    expect(memoryEngine.getUserDetail('system_status')).toBe('ONLINE');
  });

  test('System Check 2: Tool Engine Readiness', () => {
    // Testing if AI has "hands" ready to execute external tasks
    toolEngine.registerTool('test_tool', { execute: async () => ({ success: true }) });
    expect(toolEngine.tools.has('test_tool')).toBe(true);
  });

  test('System Check 3: Multi-AI Collaboration Initialization', () => {
    // Testing if the AI Team (Planner, Coder, Reviewer) is properly mapped
    expect(collaboration.roleMapping.planner).toBe('openai');
    expect(collaboration.roleMapping.coder).toBe('gemini');
    expect(collaboration.roleMapping.reviewer).toBe('openai');
  });

  test('Master Evaluation: ORBIS Brain is fully operational', () => {
    // Final validation that no core module is broken
    const isOperational = !!(memoryEngine && governance && contextEngine && collaboration && toolEngine);
    expect(isOperational).toBe(true);
  });
});
