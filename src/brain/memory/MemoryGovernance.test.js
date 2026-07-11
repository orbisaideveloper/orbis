import { MemoryGovernance } from './MemoryGovernance.js';
import { MemoryEngine } from './MemoryEngine.js';

describe('MemoryGovernance (Step 07)', () => {
  let memoryEngine;
  let governance;

  beforeEach(() => {
    memoryEngine = new MemoryEngine();
    governance = new MemoryGovernance(memoryEngine);
    
    // Pre-populate some dummy data for testing
    memoryEngine.saveUserDetail('favorite_language', 'JavaScript');
    memoryEngine.saveUserDetail('secret_project', 'Orbis-V1');
  });

  test('should forget a specific memory', () => {
    const result = governance.forgetUserDetail('favorite_language');
    expect(result.success).toBe(true);
    expect(memoryEngine.getUserDetail('favorite_language')).toBeNull(); // Memory should be gone
  });

  test('should update an existing memory', () => {
    governance.updateUserDetail('favorite_language', 'TypeScript');
    expect(memoryEngine.getUserDetail('favorite_language')).toBe('TypeScript');
  });

  test('should export all user data accurately', () => {
    const exportResult = governance.exportUserData();
    expect(exportResult.success).toBe(true);
    expect(exportResult.data['secret_project']).toBe('Orbis-V1');
  });

  test('should completely wipe user memory when nuclear option is called', () => {
    const wipeResult = governance.wipeAllUserData();
    expect(wipeResult.success).toBe(true);
    expect(governance.exportUserData().data).toEqual({}); // Everything should be empty
  });
});
