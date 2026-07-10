/**
 * ContextEngine: Combines Memory, User Context, and Task Context
 * before routing the request to the AI provider.
 */
export class ContextEngine {
  constructor() {}

  buildContext(memoryInterface, taskInput) {
    // মেমরি ইন্টারফেস থেকে সব ডেটা সংগ্রহ করা হচ্ছে
    const userContext = memoryInterface.getUserContext('theme') || 'default';
    const projectContext = memoryInterface.getProjectContext('projectId') || 'none';
    const sessionMemory = memoryInterface.getSessionMemory('activeTask') || 'idle';
    const history = memoryInterface.getConversationHistory();

    // সবকিছু মিলিয়ে একটি এনরিচড (Enriched) কনটেক্সট তৈরি করা হচ্ছে
    return {
      task: taskInput,
      environment: {
        theme: userContext,
        projectId: projectContext,
        activeTask: sessionMemory
      },
      history: history,
      timestamp: Date.now()
    };
  }
}
