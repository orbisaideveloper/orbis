import { MemoryRepository } from './MemoryRepository.js';

/**
 * MemoryEngine: Core intelligence memory manager.
 * Uses fast local caches (RAM) and persists data via MemoryRepository.
 */
export class MemoryEngine {
  constructor(repository = null) {
    // রেপোজিটরি না দিলে সে নিজে থেকেই ডাটাবেস এক্সপার্টকে (Repository) ডেকে নেবে
    this.repository = repository || new MemoryRepository();
    
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
      this.projectMemory.get(key).push(value); 
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
        else if (category === 'project') this.projectMemory.set(key, dbValue); 
        else this.cache.set(`${category}_${key}`, dbValue);
        return dbValue;
      }
    }
    return category === 'project' ? [] : null; 
  }

  // ==============================================================
  // ⚠️ EXACT BACKWARD COMPATIBILITY (Restored for Phase 1-4 Tests)
  // ==============================================================
  
  saveProjectData(projectId, data) {
    if (!projectId) throw new Error("Key is required");
    if (!this.projectMemory.has(projectId)) {
      this.projectMemory.set(projectId, []);
    }
    this.projectMemory.get(projectId).push(data);
  }

  getProjectData(projectId) {
    if (!projectId) throw new Error("Key is required");
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
  
  // ==============================================================
  // 🧠 HYBRID CHAT HISTORY (Local RAM + Persistent Supabase)
  // ==============================================================
  async saveConversation(role, message, sessionId = 'default_user') {
    if (!role || !message) throw new Error("Role and message are required");
    
    // ১. লোকাল RAM-এ সেভ (দ্রুত কাজের জন্য)
    this.history.push({ role, message, content: message });

    // ২. পারমানেন্ট মেমোরিতে সেভ (রেপোজিটরির মাধ্যমে)
    if (this.repository) {
       await this.repository.saveConversationMessage(sessionId, role, message);
    }
  }

  async getRecentConversations(sessionId = 'default_user', limit = 6) {
    // ডাটাবেস থেকে আনার চেষ্টা করবে
    if (this.repository) {
       const dbHistory = await this.repository.getRecentConversations(sessionId, limit);
       if (dbHistory && dbHistory.length > 0) {
           return dbHistory;
       }
    }
    // ডাটাবেস না পেলে আগের মতো লোকাল মেমোরিটাই দেবে
    return this.history;
  }
  
  clearHistory() {
    this.history = [];
  }
}
