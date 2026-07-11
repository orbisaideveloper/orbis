import { expect, test, describe, beforeEach } from '@jest/globals';
import { ToolEngine } from './ToolEngine.js';

describe('STEP 02: Dynamic Tool Registry', () => {
  let engine;
  
  // A mock JSON configuration showing how tools will be added in the future
  const mockConfig = {
    tools: [
      { name: 'github_scanner', description: 'Scans GitHub repositories', active: true },
      { name: 'google_drive_reader', description: 'Reads Docs', active: true },
      { name: 'legacy_broken_tool', description: 'Deprecated tool', active: false } // Should be ignored
    ]
  };

  beforeEach(() => {
    engine = new ToolEngine();
  });

  test('should dynamically load only active tools from configuration', async () => {
    await engine.initialize(mockConfig);
    
    expect(engine.tools.has('github_scanner')).toBe(true);
    expect(engine.tools.has('google_drive_reader')).toBe(true);
    expect(engine.tools.has('legacy_broken_tool')).toBe(false); // Inactive tool is ignored
  });

  test('should execute a dynamically loaded tool successfully', async () => {
    await engine.initialize(mockConfig);
    const result = await engine.executeTool('github_scanner', { repo: 'orbis-core' });
    
    expect(result.status).toBe('success');
    expect(result.tool).toBe('github_scanner');
    expect(result.args.repo).toBe('orbis-core');
  });

  test('should throw error for unregistered tools', async () => {
     await expect(engine.executeTool('unknown_tool', {})).rejects.toThrow();
  });
});
