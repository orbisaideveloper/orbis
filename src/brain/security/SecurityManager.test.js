import { jest } from '@jest/globals';
import { SecurityManager } from './SecurityManager.js';

describe('SecurityManager', () => {
  let securityManager;

  beforeEach(() => {
    securityManager = new SecurityManager();
  });

  test('should securely store, mask, and retrieve API keys', () => {
    securityManager.storeApiKey('openai', 'sk-1234567890abcdef');
    
    const key = securityManager.getDecryptedKey('openai');
    const masked = securityManager.apiKeys.get('openai').masked;
    
    expect(key).toBe('sk-1234567890abcdef');
    expect(masked).toBe('sk-1***cdef');
  });

  test('should verify JWT token format correctly', () => {
    const validResult = securityManager.verifyToken('Bearer my-secret-jwt-token');
    expect(validResult.valid).toBe(true);
    expect(validResult.user.role).toBe('admin');

    const invalidResult = securityManager.verifyToken('invalid-token-format');
    expect(invalidResult.valid).toBe(false);
  });

  test('should enforce strict RBAC permissions', () => {
    expect(securityManager.hasPermission('admin', 'manage_keys')).toBe(true);
    expect(securityManager.hasPermission('user', 'manage_keys')).toBe(false);
    expect(securityManager.hasPermission('user', 'execute')).toBe(true);
    expect(securityManager.hasPermission('guest', 'write')).toBe(false);
  });

  test('should maintain audit logs for system actions', () => {
    securityManager.storeApiKey('gemini', 'sk-test');
    securityManager.hasPermission('guest', 'write'); // This will fail and log it

    const logs = securityManager.getAuditLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].action).toBe('store_key');
    expect(logs[1].action).toBe('access_denied');
  });
});
