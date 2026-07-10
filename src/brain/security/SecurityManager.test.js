import { jest } from '@jest/globals';
import { SecurityManager } from './SecurityManager.js';

describe('SecurityManager Foundation', () => {
  let securityManager;

  beforeEach(() => {
    securityManager = new SecurityManager();
  });

  test('should register and check API keys', () => {
    securityManager.registerApiKey('openai', 'sk-dummy-key');
    expect(securityManager.hasApiKey('openai')).toBe(true);
    expect(securityManager.hasApiKey('gemini')).toBe(false);
  });

  test('should allow basic authentication and authorization (Foundation)', () => {
    expect(securityManager.authenticateRequest({})).toBe(true);
    expect(securityManager.authorizeAction('admin', 'delete')).toBe(true);
  });

  test('should record audit logs correctly', () => {
    securityManager.logAudit('test_action', 'Testing audit log');
    const logs = securityManager.getAuditLogs();
    
    expect(logs.length).toBe(1);
    expect(logs[0].action).toBe('test_action');
    expect(logs[0].details).toBe('Testing audit log');
    expect(logs[0].timestamp).toBeDefined();
  });
});
