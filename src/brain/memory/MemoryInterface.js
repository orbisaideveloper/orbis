/**
 * MemoryInterface: A modular memory architecture handling
 * User Context, Conversation History, Project Context, and Session Memory.
 */
export class MemoryInterface {
  constructor() {
    this.memory = {
      userContext: new Map(),
      conversationHistory: [],
      projectContext: new Map(),
      sessionMemory: new Map()
    };
  }

  // === User Context ===
  setUserContext(key, value) {
    this.memory.userContext.set(key, value);
  }
  getUserContext(key) {
    return this.memory.userContext.get(key);
  }

  // === Conversation History ===
  addConversation(role, message) {
    this.memory.conversationHistory.push({
      role,
      message,
      timestamp: Date.now()
    });
  }
  getConversationHistory() {
    return this.memory.conversationHistory;
  }

  // === Project Context ===
  setProjectContext(key, value) {
    this.memory.projectContext.set(key, value);
  }
  getProjectContext(key) {
    return this.memory.projectContext.get(key);
  }

  // === Session Memory ===
  setSessionMemory(key, value) {
    this.memory.sessionMemory.set(key, value);
  }
  getSessionMemory(key) {
    return this.memory.sessionMemory.get(key);
  }
  clearSession() {
    this.memory.sessionMemory.clear();
  }
}
