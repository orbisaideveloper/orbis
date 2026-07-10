/**
 * CapabilityRegistry: Stores the capabilities, supported tasks, 
 * strengths, and limitations of every AI provider.
 */
export class CapabilityRegistry {
  constructor() {
    this.providers = {
      openai: {
        id: 'gpt-4o',
        name: 'OpenAI GPT-4o',
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
      },
      claude: {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        capabilities: ['GENERAL', 'CODING', 'DOCUMENT_ANALYSIS'],
        strengths: ['LARGE_CONTEXT', 'NUANCE', 'CODE_GENERATION'],
        status: 'active'
      },
      grok: {
        id: 'grok-2',
        name: 'Grok 2',
        capabilities: ['GENERAL', 'REAL_TIME_SEARCH'],
        strengths: ['LIVE_DATA', 'UNCENSORED'],
        status: 'active'
      },
      deepseek: {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        capabilities: ['CODING', 'DEBUGGING'],
        strengths: ['CODE_OPTIMIZATION', 'MATH'],
        status: 'active'
      },
      local: {
        id: 'local-model',
        name: 'Local Models',
        capabilities: ['GENERAL', 'PRIVACY_FIRST'],
        strengths: ['OFFLINE', 'DATA_SECURITY'],
        status: 'active'
      }
    };
  }

  getProviderByTask(taskType) {
    const matchedProvider = Object.values(this.providers).find(p =>
      p.capabilities.includes(taskType) && p.status === 'active'
    );
    return matchedProvider || null;
  }

  getAllProviders() {
    return Object.values(this.providers);
  }
}
