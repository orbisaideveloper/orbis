import { expect, test, describe, beforeEach, jest } from '@jest/globals';
import { RecoveryEngine } from './RecoveryEngine.js';

describe('STEP 03: AI Recovery Engine', () => {
  let recoveryEngine;
  let mockRegistry;
  let primaryProvider;
  let fallbackProvider;

  beforeEach(() => {
    // Mocking AI providers
    primaryProvider = { execute: jest.fn() };
    fallbackProvider = { execute: jest.fn() };
    
    // Setting up a dummy registry map
    mockRegistry = new Map();
    mockRegistry.set('openai', primaryProvider);
    mockRegistry.set('gemini', fallbackProvider);
    
    recoveryEngine = new RecoveryEngine(mockRegistry);
  });

  test('should succeed on first try without triggering fallback', async () => {
    primaryProvider.execute.mockResolvedValue({ success: true, data: 'primary_result' });
    
    const result = await recoveryEngine.executeWithRecovery('openai', 'gemini', {});
    
    expect(result.data).toBe('primary_result');
    expect(primaryProvider.execute).toHaveBeenCalledTimes(1);
    expect(fallbackProvider.execute).not.toHaveBeenCalled(); // Fallback untouched
  });

  test('should retry and switch to fallback if primary provider crashes', async () => {
    // Primary always fails
    primaryProvider.execute.mockRejectedValue(new Error('503 Service Unavailable'));
    // Fallback succeeds
    fallbackProvider.execute.mockResolvedValue({ success: true, data: 'fallback_result' });
    
    const result = await recoveryEngine.executeWithRecovery('openai', 'gemini', {});
    
    expect(result.data).toBe('fallback_result');
    expect(primaryProvider.execute).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
    expect(fallbackProvider.execute).toHaveBeenCalledTimes(1); // Fallback kicked in
    
    // Check Audit Log
    const logs = recoveryEngine.getAuditLogs();
    expect(logs.some(log => log.action === 'FALLBACK_INITIATED')).toBe(true);
    expect(logs.some(log => log.action === 'RECOVERED')).toBe(true);
  });

  test('should throw final error if both primary and fallback fail (Total Outage)', async () => {
    primaryProvider.execute.mockRejectedValue(new Error('Primary Down'));
    fallbackProvider.execute.mockRejectedValue(new Error('Fallback Down'));
    
    await expect(
      recoveryEngine.executeWithRecovery('openai', 'gemini', {})
    ).rejects.toThrow(/Critical Failure/);
    
    const logs = recoveryEngine.getAuditLogs();
    expect(logs[logs.length - 1].action).toBe('FINAL_FAILURE');
  });
});
