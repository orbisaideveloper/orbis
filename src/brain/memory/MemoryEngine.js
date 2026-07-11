/**
 * MemoryEngine: Core intelligence memory manager.
 * Uses a fast local cache (RAM) and persists data via MemoryRepository.
 */
export class MemoryEngine {
  constructor(repository = null) {
    this.repository = repository;
    this.cache = new Map();
    this.userMemory = this.cache; // Backward compatibility for old governance tests
  }

  // --- NEW UNIVERSAL METHODS (STEP 01) ---
  async saveMemory(category, key, value) {
    if (!key) throw new Error("Key cannot be null or undefined");
    const cacheKey = `${category}_${key}`;
    this.cache.set(cacheKey, value);
    if (this.repository) {
      await this.repository.save(category, key, value);
    }
    return { success: true, category, key };
  }

  async getMemory(category, key) {
    if (!key) throw new Error("Key cannot be null or undefined");
    const cacheKey = `${category}_${key}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    
    if (this.repository) {
      const dbValue = await this.repository.get(category, key);
      if (dbValue !== null) {
        this.cache.set(cacheKey, dbValue);
        return dbValue;
      }
    }
    return null;
  }

  // ==============================================================
  // ⚠️ BACKWARD COMPATIBILITY (Restored for Phase 1-4 Tests)
  // ==============================================================
  
  saveProjectData(key, value) {
    if (!key) throw new Error("Key is required");
    this.cache.set(`project_${key}`, value);
    if (this.repository) this.repository.save('project', key, value).catch(() => {});
  }

  getProjectData(key) {
    return this.cache.get(`project_${key}`) || null;
  }

  saveUserDetail(key, value) {
    if (!key) throw new Error("Key is required");
    this.cache.set(`user_${key}`, value);
    if (this.repository) this.repository.save('user', key, value).catch(() => {});
  }

  getUserDetail(key) {
    return this.cache.get(`user_${key}`) || null;
  }
  
  saveConversationData(key, value) {
    if (!key) throw new Error("Key is required");
    this.cache.set(`conversation_${key}`, value);
    if (this.repository) this.repository.save('conversation', key, value).catch(() => {});
  }

  getConversationData(key) {
     return this.cache.get(`conversation_${key}`) || null;
  }
}
