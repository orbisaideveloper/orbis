/**
 * ContextIntelligenceEngine: Aggregates User, Project, and Memory data
 * to build an intelligent, context-aware prompt for AI providers.
 */
export class ContextEngine {
  constructor(memoryEngine, vectorEngine) {
    this.memoryEngine = memoryEngine;
    this.vectorEngine = vectorEngine;
  }

  async buildContext(taskId, userPrompt) {
    // 1. Fetch relevant memories via semantic search
    const relevantMemories = await this.vectorEngine.retrieve(userPrompt);
    
    // 2. Fetch recent conversation history
    const history = this.memoryEngine.getRecentConversations(5);
    
    // 3. Assemble the "Context-Aware" Prompt
    return {
      task: taskId,
      originalPrompt: userPrompt,
      contextData: {
        memories: relevantMemories,
        history: history,
        timestamp: Date.now()
      },
      finalPrompt: `Task: ${userPrompt}\n\nRelevant History: ${JSON.stringify(history)}\n\nMemory Context: ${JSON.stringify(relevantMemories)}`
    };
  }
}
