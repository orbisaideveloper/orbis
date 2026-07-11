/**
 * MemoryEngine: Core intelligence memory manager.
 * Uses a fast local cache (RAM) and persists data via MemoryRepository.
 */
export class MemoryEngine {
  constructor(repository = null) {
    this.repository = repository;
    this.cache = new Map();
    
    // Backward compatibility for Phase 5 Governance tests
    this.userMemory = this.cache; 
  }

  /**
   * Universal async method to save any type of memory (User, Project, Session, etc.)
   */
  async saveMemory(category, key, value) {
    const cacheKey = `${category}_${key}`;
    this.cache.set(cacheKey, value);

    if (this.repository) {
      await this.repository.save(category, key, value);
    }
    return { success: true, category, key };
  }

  /**
   * Universal async method to retrieve memory
   */
  async getMemory(category, key) {
    const cacheKey = `${category}_${key}`;
    
    // 1. Check fast local RAM cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. Fallback to Persistent Database
    if (this.repository) {
      const dbValue = await this.repository.get(category, key);
      if (dbValue !== null) {
        this.cache.set(cacheKey, dbValue); // Restore to fast cache
        return dbValue;
      }
    }
    return null;
  }

  // --- Backward Compatibility Methods for existing System Tests ---
  saveUserDetail(key, value) {
    this.saveMemory('user', key, value).catch(() => {}); // Fire and forget async
  }

  getUserDetail(key) {
    return this.cache.get(`user_${key}`) || null;
  }
}
