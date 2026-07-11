import { expect, test, describe, beforeEach } from '@jest/globals';
import { DeveloperDashboard } from './DeveloperDashboard.js';

describe('STEP 04: Developer Preview Dashboard', () => {
  let dashboard;
  
  beforeEach(() => {
    // Mocking system modules to test the dashboard aggregator
    const mockMemory = { userMemory: new Map(), projectMemory: new Map(), history: [] };
    const mockTools = { tools: new Map([['test_tool', {}], ['github_scanner', {}]]) };
    const mockRecovery = { 
      getAuditLogs: () => [
        { level: 'INFO', action: 'START', message: 'System started' },
        { level: 'ERROR', action: 'CRASH', message: 'Test error caught' }
      ] 
    };

    dashboard = new DeveloperDashboard({
      memory: mockMemory,
      tools: mockTools,
      recovery: mockRecovery
    });
  });

  test('should generate a complete system snapshot with correct data', () => {
    const snapshot = dashboard.generateSystemSnapshot();
    
    expect(snapshot.system_status).toBe('ONLINE');
    
    // Testing Tool aggregation
    expect(snapshot.tool_engine.registered_tools.length).toBe(2);
    expect(snapshot.tool_engine.registered_tools).toContain('github_scanner');
    
    // Testing Recovery/Error aggregation
    expect(snapshot.recovery_system.audit_logs.length).toBe(2);
    expect(snapshot.recovery_system.total_errors_caught).toBe(1); // One ERROR log
    
    // Testing Memory aggregation
    expect(snapshot.memory_status.status).toBe('ACTIVE');
  });

  test('should gracefully handle missing system modules', () => {
    const emptyDashboard = new DeveloperDashboard({});
    const snapshot = emptyDashboard.generateSystemSnapshot();
    
    expect(snapshot.memory_status.status).toBe('OFFLINE');
    expect(snapshot.tool_engine.registered_tools.length).toBe(0);
    expect(snapshot.recovery_system.total_errors_caught).toBe(0);
  });
});
