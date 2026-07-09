// CapabilityRegistry.js
export const CapabilityRegistry = {
  providers: {
    openai: {
      id: 'gpt-4o',
      name: 'GPT-4o',
      capabilities: ['GENERAL', 'CREATIVE', 'CODING'],
      strengths: ['NATURAL_LANGUAGE', 'INSTRUCTION_FOLLOWING'],
      status: 'active'
    },
    gemini: {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      capabilities: ['GENERAL', 'ANALYSIS', 'CODING', 'MULTIMODAL'],
      strengths: ['LARGE_CONTEXT', 'REASONING'],
      status: 'active'
    }
  },

  getProviderByTask(taskType) {
    return Object.values(this.providers).find(p => 
      p.capabilities.includes(taskType) && p.status === 'active'
    );
  }
};
