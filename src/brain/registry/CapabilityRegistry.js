/**
 * CapabilityRegistry: Brick for storing AI provider capabilities.
 */
export const CapabilityRegistry = {
  providers: {
    gemini: {
      id: 'gemini-pro',
      name: 'Gemini',
      capabilities: ['CODING', 'REASONING', 'GENERAL'],
      strengths: ['COMPLEX_LOGIC', 'CODE_GENERATION'],
      status: 'active'
    },
    openai: {
      id: 'gpt-4o',
      name: 'GPT-4o',
      capabilities: ['GENERAL', 'CREATIVE', 'CODING'],
      strengths: ['NATURAL_LANGUAGE', 'INSTRUCTION_FOLLOWING'],
      status: 'active'
    }
  },

  getProviderByTask(taskType) {
    return Object.values(this.providers).find(p => 
      p.capabilities.includes(taskType) && p.status === 'active'
    );
  }
};
