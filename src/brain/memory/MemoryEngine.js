import { MemoryRepository } from './MemoryRepository.js';

/**
 * MemoryEngine: Core intelligence memory manager.
 * Uses fast local caches (RAM) and persists data via MemoryRepository.
 */
export class MemoryEngine {
  constructor(repository = null) {
    this.repository = repository || new MemoryRepository();
    
    this.userMemory = new Map(); 
    this.projectMemory = new Map();
    this.history = [];
    
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
    
    this.history.push({ role, message, content: message });

    if (this.repository) {
       await this.repository.saveConversationMessage(sessionId, role, message);
    }
  }

  async getRecentConversations(sessionId = 'default_user', limit = 6) {
    if (this.repository) {
       const dbHistory = await this.repository.getRecentConversations(sessionId, limit);
       if (dbHistory && dbHistory.length > 0) {
           return dbHistory;
       }
    }
    return this.history;
  }
  
  clearHistory() {
    this.history = [];
  }

  // ==============================================================
  // 🚀 PHASE 6C: COGNITIVE ENGINE (Vector Embeddings & Semantic Search)
  // ==============================================================
  
  // গুগল জেমিনির মাধ্যমে সাধারণ লেখাকে ভেক্টরে রূপান্তর করার ম্যাজিক ফাংশন
  async generateEmbedding(text) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/text-embedding-004',
                content: { parts: [{ text }] }
            })
        });

        const data = await response.json();
        if (data.embedding && data.embedding.values) {
            return data.embedding.values; // ৭৬৮ ডাইমেনশনের অ্যারে
        }
        return null;
    } catch (error) {
        console.error("[MemoryEngine] Embedding Error:", error.message);
        return null;
    }
  }

  // জেমিনির কাছে যাওয়ার আগে লোকাল ভেক্টর মেমোরিতে উত্তর খোঁজা
  async searchCognitiveMemory(userInput, sessionId) {
    if (!this.repository) return null;
    try {
        console.log("[MemoryEngine] Generating vector for search...");
        const embedding = await this.generateEmbedding(userInput);
        if (!embedding) return null;

        // ০.৮৫ (85%) মিল থাকলে তবেই উত্তরটা ক্যাশ থেকে নেবে
        const matches = await this.repository.searchSemanticMemory(embedding, 0.85, 1);
        
        if (matches && matches.length > 0) {
            return matches[0].ai_response;
        }
        return null;
    } catch (error) {
        console.error("[MemoryEngine] Cognitive Search Failed:", error.message);
        return null;
    }
  }

  // নতুন কথা এবং উত্তর ভবিষ্যতের জন্য ভেক্টর হিসেবে সেভ করে রাখা
  async saveCognitiveMemory(sessionId, userInput, aiResponse) {
    if (!this.repository) return false;
    try {
        const embedding = await this.generateEmbedding(userInput);
        if (!embedding) return false;

        return await this.repository.saveSemanticMemory(sessionId, userInput, aiResponse, embedding);
    } catch (error) {
        console.error("[MemoryEngine] Cognitive Save Failed:", error.message);
        return false;
    }
  }
}
