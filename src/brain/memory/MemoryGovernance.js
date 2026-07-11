/**
 * MemoryGovernance: Empowers the user with full control over their data.
 * Handles operations to update, forget, export, or wipe memories to ensure privacy.
 */
export class MemoryGovernance {
  constructor(memoryEngine) {
    this.memoryEngine = memoryEngine;
  }

  /**
   * Forgets a specific user memory by key.
   */
  forgetUserDetail(key) {
    if (!this.memoryEngine.userMemory.has(key)) {
      return { success: false, message: 'Memory not found.' };
    }
    this.memoryEngine.userMemory.delete(key);
    return { success: true, message: `Successfully forgot: ${key}` };
  }

  /**
   * Updates an existing memory.
   */
  updateUserDetail(key, newValue) {
    this.memoryEngine.saveUserDetail(key, newValue);
    return { success: true, message: `Memory updated for: ${key}` };
  }

  /**
   * Exports all personal data (Privacy & Compliance feature).
   */
  exportUserData() {
    const data = Object.fromEntries(this.memoryEngine.userMemory);
    return { success: true, data };
  }

  /**
   * The "Nuclear Option": Wipes all user data permanently.
   */
  wipeAllUserData() {
    this.memoryEngine.userMemory.clear();
    return { success: true, message: 'All personal data has been permanently deleted.' };
  }
}
