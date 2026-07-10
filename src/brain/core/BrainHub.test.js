import { jest } from '@jest/globals';
import { BrainHub } from './BrainHub.js';

describe('BrainHub', () => {
  let brainHub;

  beforeEach(() => {
    brainHub = new BrainHub();
  });

  test('should initialize all core modules successfully', () => {
    expect(brainHub.security).toBeDefined();
    expect(brainHub.memory).toBeDefined();
    expect(brainHub.contextEngine).toBeDefined();
    expect(brainHub.decision).toBeDefined();
    expect(brainHub.orchestrator).toBeDefined();
    expect(brainHub.workflow).toBeDefined();
  });

  test('should process incoming requests', async () => {
    const result = await brainHub.processRequest('Analyze codebase');
    expect(result).toContain('acknowledged and processed');
    
    const logs = brainHub.security.getAuditLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe('process_request');
  });
});
