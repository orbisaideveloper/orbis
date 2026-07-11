/**
 * MemoryEngine: Core intelligence memory manager.
 * Uses fast local caches (RAM) and persists data via MemoryRepository.
 */
export class MemoryEngine {
  constructor(repository = null) {
    this.repository = repository;
    
    // ⚠️ Separate Maps to perfectly match Phase 1-4 tests and Governance
    this.userMemory = new Map(); 
    this.projectMemory = new Map();
    this.history = [];
    
    // Universal Cache for other categories
    this.cache = new Map();
  }

  // ==============================================================
  // --- NEW UNIVERSAL METHODS (STEP 01) ---
  // ==============================================================
  async saveMemory(category, key, value) {
    if (!key) throw new Error("Key cannot be null or undefined");
    
    // Route to specific maps for backward compatibility
    if (category === 'user') this.userMemory.set(key, value);
    else if (category === 'project') this.projectMemory.set(key, value);
    else this.cache.set(`${category}_${key}`, value);

    if (this.repository) {
      await this.repository.save(category, key, value).catch(() => {});
    }
    return { success: true, category, key };
  }

  async getMemory(category, key) {
    if (!key) throw new Error("Key cannot be null or undefined");
    
    let val = null;
    if (category === 'user') val = this.userMemory.get(key);
    else if (category === 'project') val = this.projectMemory.get(key);
    else val = this.cache.get(`${category}_${key}`);

    if (val !== undefined && val !== null) return val;

    if (this.repository) {
      const dbValue = await this.repository.get(category, key);
      if (dbValue !== null) {
        if (category === 'user') this.userMemory.set(key, dbValue);
        else if (category === 'project') this.projectMemory.set(key, dbValue);
        else this.cache.set(`${category}_${key}`, dbValue);
        return dbValue;
      }
    }
    return null;
  }

  // ==============================================================
  // ⚠️ EXACT BACKWARD COMPATIBILITY (Restored for Phase 1-4 Tests)
  // ==============================================================
  
  saveProjectData(key, value) {
    if (!key) throw new Error("Key is required");
    this.projectMemory.set(key, value);
  }

  getProjectData(key) {
    if (!key) throw new Error("Key is required");
    return this.projectMemory.get(key) || null;
  }

  saveUserDetail(key, value) {
    if (!key) throw new Error("Key is required");
    this.userMemory.set(key, value);
  }

  getUserDetail(key) {
    if (!key) throw new Error("Key is required");
    return this.userMemory.get(key) || null;
  }
  
  saveConversation(role, message) {
    if (!role || !message) throw new Error("Role and message are required");
    this.history.push({ role, message, content: message });
  }

  getRecentConversations() {
    return this.history;
  }
  
  clearHistory() {
    this.history = [];
  }
}
