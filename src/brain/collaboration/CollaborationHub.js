/**
 * CollaborationHub: Facilitates safe communication and data passing
 * between different AI providers (e.g., passing OpenAI output to Gemini).
 */
export class CollaborationHub {
  constructor() {
    // Stores active multi-agent conversation threads
    this.activeSessions = new Map();
  }

  /**
   * Initializes a new collaboration session for a specific task.
   */
  createSession(taskId) {
    if (this.activeSessions.has(taskId)) {
      throw new Error(`Session for task ${taskId} already exists.`);
    }
    const session = {
      taskId,
      history: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.activeSessions.set(taskId, session);
    return session;
  }

  /**
   * Adds a message/output from a specific provider to the shared session.
   */
  addMessage(taskId, providerId, role, content) {
    const session = this.activeSessions.get(taskId);
    if (!session) {
      throw new Error(`No active session found for task ${taskId}.`);
    }
    if (session.status !== 'active') {
      throw new Error(`Session for task ${taskId} is closed.`);
    }
    
    const message = {
      timestamp: Date.now(),
      providerId,
      role, // e.g., 'system', 'user', 'assistant'
      content
    };
    
    session.history.push(message);
    return message;
  }

  /**
   * Retrieves the entire context history for a task, 
   * so the next AI model knows what previous models have done.
   */
  getSessionContext(taskId) {
    const session = this.activeSessions.get(taskId);
    if (!session) return null;
    return session.history;
  }
  
  /**
   * Safely closes the collaboration session.
   */
  closeSession(taskId) {
    const session = this.activeSessions.get(taskId);
    if (session && session.status === 'active') {
      session.status = 'closed';
      return true;
    }
    return false;
  }
}
