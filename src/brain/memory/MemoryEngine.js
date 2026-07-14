import { MemoryRepository } from './MemoryRepository.js';

/**
 * MemoryEngine: Core intelligence memory manager.
 * Refactored: Unified API, Telemetry Hooks, and Backward Compatibility.
 */
export class MemoryEngine {
  constructor(repository = null) {
    this.repository = repository || new MemoryRepository();
    
    // 🟢 RAM Caches (Preserved for Backward Compatibility)
    this.userMemory = new Map(); 
    this.projectMemory = new Map();
    this.history = []; // Tracks active session nodes for telemetry
    this.cache = new Map();
  }

  // ==============================================================
  // 🟢 TELEMETRY & DASHBOARD HOOK (ড্যাশবোর্ড সচল রাখার জন্য)
  // ==============================================================
  _logMemoryEvent(event) {
    if (typeof global.systemLogs !== 'undefined') {
        const time = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
        global.systemLogs.push({ time, level: 'INFO', message: `[Memory] ${event}` });
        if (global.systemLogs.length > 100) global.systemLogs.shift();
    }
  }

  // ড্যাশবোর্ডের মেমোরি নোড আপডেটের জন্য
  getNodes() {
    return this.history;
  }

  // ==============================================================
  // 🟢 UNIFIED OFFICIAL API (MemoryInterface এখান থেকেই ডেটা নেবে)
  // ==============================================================
  async saveMemory(category, key, value) {
    if (!key) throw new Error("Key cannot be null");
    
    if (category === 'user') this.userMemory.set(key, value);
    else if (category === 'project') {
      if (!this.projectMemory.has(key)) this.projectMemory.set(key, []);
      this.projectMemory.get(key).push(value); 
    } else this.cache.set(`${category}_${key}`, value);

    if (this.repository && typeof this.repository.save === 'function') {
      await this.repository.save(category, key, value).catch(() => {});
    }
    
    this._logMemoryEvent(`Saved ${category} data for key: ${key}`);
    return { success: true, category, key };
  }

  async loadMemory(category, key) {
    if (!key) throw new Error("Key cannot be null");
    
    let val = null;
    if (category === 'user') val = this.userMemory.get(key);
    else if (category === 'project') val = this.projectMemory.get(key);
    else val = this.cache.get(`${category}_${key}`);

    if (val !== undefined && val !== null) return val;

    if (this.repository && typeof this.repository.get === 'function') {
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

  async saveConversation(sessionId, prompt, response) {
    if (!prompt || !response) return false;
    
    // ১. Save to RAM (UI এর জন্য)
    this.history.push({ role: 'user', content: prompt });
    this.history.push({ role: 'model', content: response });

    // ২. Save to Persistent DB
    if (this.repository && typeof this.repository.saveConversationMessage === 'function') {
       await this.repository.saveConversationMessage(sessionId, 'user', prompt);
       await this.repository.saveConversationMessage(sessionId, 'model', response);
    }
    
    this._logMemoryEvent(`Conversation saved for session: ${sessionId}`);
    return true;
  }

  async loadConversation(sessionId, limit = 50) {
    if (this.repository && typeof this.repository.getRecentConversations === 'function') {
       const dbHistory = await this.repository.getRecentConversations(sessionId, limit);
       if (dbHistory && dbHistory.length > 0) {
           this.history = dbHistory; // Update RAM cache
           this._logMemoryEvent(`Restored ${dbHistory.length} messages for session: ${sessionId}`);
           return dbHistory;
       }
    }
    return this.history;
  }

  // ==============================================================
  // 🚀 COGNITIVE ENGINE (Vector Embeddings & Semantic Search)
  // ==============================================================
  async generateEmbedding(text) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/text-embedding-004',
                content: { parts: [{ text }] }
            })
        });

        const data = await response.json();
        return (data.embedding && data.embedding.values) ? data.embedding.values : null;
    } catch (error) {
        this._logMemoryEvent(`Embedding Error: ${error.message}`);
        return null;
    }
  }

  async searchCognitiveMemory(sessionId, userInput) {
    if (!this.repository) return null;
    try {
        const embedding = await this.generateEmbedding(userInput);
        if (!embedding) return null;

        if (typeof this.repository.searchSemanticMemory === 'function') {
            const matches = await this.repository.searchSemanticMemory(embedding, 0.85, 1);
            if (matches && matches.length > 0) {
                this._logMemoryEvent(`Cognitive match found (Session: ${sessionId})`);
                return matches[0].ai_response;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
  }

  async saveCognitiveMemory(sessionId, userInput, aiResponse) {
    if (!this.repository) return false;
    try {
        const embedding = await this.generateEmbedding(userInput);
        if (!embedding) return false;

        if (typeof this.repository.saveSemanticMemory === 'function') {
            await this.repository.saveSemanticMemory(sessionId, userInput, aiResponse, embedding);
            this._logMemoryEvent(`Cognitive memory synced (Session: ${sessionId})`);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
  }

  // ==============================================================
  // ⚠️ EXACT BACKWARD COMPATIBILITY (পুরোনো কোড ব্রেক না করার জন্য)
  // ==============================================================
  saveProjectData(projectId, data) {
    if (!projectId) return;
    if (!this.projectMemory.has(projectId)) this.projectMemory.set(projectId, []);
    this.projectMemory.get(projectId).push(data);
  }

  getProjectData(projectId) {
    return this.projectMemory.get(projectId) || [];
  }

  saveUserDetail(key, value) {
    if (key) this.userMemory.set(key, value);
  }

  getUserDetail(key) {
    return this.userMemory.get(key) || null;
  }

  clearHistory() {
    this.history = [];
  }
}
