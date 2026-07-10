/**
 * MemoryEngine: The core manager for ORBIS Long-Term Memory.
 * Strictly separates User Memory (personal data/diary) from Project Memory.
 */
export class MemoryEngine {
  constructor() {
    // Modular memory stores (Simulating Vector/DB storage for architecture readiness)
    this.userMemory = new Map();
    this.projectMemory = new Map();
    this.conversationMemory = [];
  }

  /**
   * 1. User Memory: Stores personal preferences, context, and "diary" entries.
   */
  saveUserDetail(key, value) {
    if (!key || !value) throw new Error('Key and Value required for User Memory.');
    this.userMemory.set(key, value);
    return true;
  }

  getUserDetail(key) {
    return this.userMemory.get(key) || null;
  }

  /**
   * 2. Project Memory: Strictly isolated from user's personal data.
   */
  saveProjectData(projectId, data) {
    if (!projectId) throw new Error('Project ID required.');
    if (!this.projectMemory.has(projectId)) {
      this.projectMemory.set(projectId, []);
    }
    this.projectMemory.get(projectId).push(data);
    return true;
  }

  getProjectData(projectId) {
    return this.projectMemory.get(projectId) || [];
  }

  /**
   * 3. Conversation Memory: Remembers the flow of chat so the AI doesn't forget.
   */
  saveConversation(role, message) {
    if (!role || !message) throw new Error('Role and message required.');
    const entry = { timestamp: Date.now(), role, message };
    this.conversationMemory.push(entry);
    return entry;
  }

  getRecentConversations(limit = 10) {
    return this.conversationMemory.slice(-limit);
  }
}
