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
    
    if (category === 'user') {
      this.userMemory.set(key, value);
    } else if (category === 'project') {
      if (!this.projectMemory.has(key)) this.projectMemory.set(key, []);
      this.projectMemory.get(key).push(value); // Push to array
    } else {
      this.cache.set(`${category}_${key}`, value);
    }

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
        else if (category === 'project') this.projectMemory.set(key, dbValue); // Assume DB returns array
        else this.cache.set(`${category}_${key}`, dbValue);
        return dbValue;
      }
    }
    return category === 'project' ? [] : null; // Return empty array for projects
  }

  // ==============================================================
  // ⚠️ EXACT BACKWARD COMPATIBILITY (Restored for Phase 1-4 Tests)
  // ==============================================================
  
  saveProjectData(projectId, data) {
    if (!projectId) throw new Error("Key is required");
    // Ensure it's stored as an Array so `.length` works in tests
    if (!this.projectMemory.has(projectId)) {
      this.projectMemory.set(projectId, []);
    }
    this.projectMemory.get(projectId).push(data);
  }

  getProjectData(projectId) {
    if (!projectId) throw new Error("Key is required");
    // Return the array, or an empty array if not found
    return this.projectMemory.get(projectId) || [];
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
