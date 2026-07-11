import { ToolEngine } from './ToolEngine.js';

describe('ToolEngine (Step 06)', () => {
  let engine;

  beforeEach(() => {
    engine = new ToolEngine();
  });

  test('should register and execute a tool successfully', async () => {
    // Mocking a dummy tool adapter (e.g., a simulated GitHub Tool)
    const mockGitHubTool = {
      execute: async (params) => ({ 
        success: true, 
        data: `Successfully pushed code to ${params.repo}` 
      })
    };

    engine.registerTool('github', mockGitHubTool);
    const result = await engine.executeTool('github', { repo: 'orbis-core' });

    expect(result.success).toBe(true);
    expect(result.data).toBe('Successfully pushed code to orbis-core');
  });

  test('should throw an error for unregistered tools', async () => {
    await expect(engine.executeTool('unknown_tool', {})).rejects.toThrow('is not registered');
  });

  test('should handle execution errors gracefully', async () => {
    const brokenTool = {
      execute: async () => { throw new Error('Network failed'); }
    };
    
    engine.registerTool('broken_api', brokenTool);
    const result = await engine.executeTool('broken_api');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network failed');
  });
});
