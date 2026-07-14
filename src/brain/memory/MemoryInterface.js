import { MemoryEngine } from './MemoryEngine.js';

/**
 * MemoryInterface: The Official Unified Gateway.
 * Refactored: Phase 9.0 - Merged Legacy Methods with New Architecture.
 */
export class MemoryInterface {
  constructor() {
    // 🟢 নতুন পাওয়ারফুল মেমোরি ইঞ্জিন
    this.engine = new MemoryEngine();

    // ⚠️ EXACT LEGACY STRUCTURE (পুরোনো কোড যেন না ভাঙে)
    // যদি কোনো ফাইল সরাসরি interface.memory.userContext কল করে, তাও কাজ করবে।
    this.memory = {
      userContext: this.engine.userMemory, 
      conversationHistory: this.engine.history,
      projectContext: this.engine.projectMemory,
      sessionMemory: this.engine.cache
    };
  }

  // ==========================================
  // 🟢 UNIFIED OFFICIAL API (NEW)
  // ==========================================
  async saveMemory(category, key, value) { return await this.engine.saveMemory(category, key, value); }
  async loadMemory(category, key) { return await this.engine.loadMemory(category, key); }
  async saveConversation(sessionId, prompt, response) { return await this.engine.saveConversation(sessionId, prompt, response); }
  async loadConversation(sessionId, limit = 50) { return await this.engine.loadConversation(sessionId, limit); }
  async saveCognitiveMemory(sessionId, concept, context) { return await this.engine.saveCognitiveMemory(sessionId, concept, context); }
  async searchCognitiveMemory(sessionId, query) { return await this.engine.searchCognitiveMemory(sessionId, query); }

  // ==========================================
  // ⚠️ LEGACY METHODS (আপনার পাঠানো পুরোনো ফাংশনগুলো)
  // ==========================================

  // === User Context ===
  setUserContext(key, value) {
    this.engine.saveMemory('user', key, value);
  }
  getUserContext(key) {
    return this.engine.userMemory.get(key);
  }

  // === Conversation History ===
  addConversation(role, message) {
    // UI-এর জন্য সাথে সাথে RAM-এ পুশ
    this.engine.history.push({ role, message, content: message, timestamp: Date.now() });
    
    // ব্যাকগ্রাউন্ডে ডাটাবেসে সেভ (সিস্টেম হ্যাং করবে না)
    if (this.engine.repository && typeof this.engine.repository.saveConversationMessage === 'function') {
        this.engine.repository.saveConversationMessage('default_user', role, message).catch(()=>{});
    }
  }
  getConversationHistory() {
    return this.engine.history;
  }

  // === Project Context ===
  setProjectContext(key, value) {
    this.engine.saveMemory('project', key, value);
  }
  getProjectContext(key) {
    const projData = this.engine.projectMemory.get(key);
    return projData ? projData[0] : null; 
  }

  // === Session Memory ===
  setSessionMemory(key, value) {
    this.engine.saveMemory('session', key, value);
  }
  getSessionMemory(key) {
    return this.engine.cache.get(`session_${key}`);
  }
  clearSession() {
    this.engine.clearHistory();
    this.engine.cache.clear();
  }

  // === Extra Legacy Adapters ===
  async saveToMemory(sessionId, data) {
      const role = data.role || 'user';
      const content = data.content || '';
      this.addConversation(role, content);
      return true;
  }
  async storeConversation(sessionId, prompt, response) {
      return await this.saveConversation(sessionId, prompt, response);
  }
  async getRecentConversations(sessionId, limit = 50) {
      return await this.loadConversation(sessionId, limit);
  }

  // ড্যাশবোর্ড টেলিমেট্রির জন্য
  get nodes() {
      return this.engine.getNodes();
  }
}
