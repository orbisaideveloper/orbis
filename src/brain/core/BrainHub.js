import { GeminiProvider } from '../providers/GeminiProvider.js';

export class BrainHub {
  constructor() {
    this.status = 'ONLINE';
    
    if (process.env.GEMINI_API_KEY) {
      this.activeProvider = new GeminiProvider(process.env.GEMINI_API_KEY);
    } else {
      this.activeProvider = {
        name: 'MockProvider',
        process: async (prompt) => `[BrainHub] Task '${prompt}' acknowledged and processed.`
      };
    }
  }

  async processRequest(prompt) {
    try {
      const responseText = await this.activeProvider.process(prompt);
      
      return {
        success: true,
        provider: this.activeProvider.name,
        response: responseText
      };
    } catch (error) {
      return {
        success: false,
        provider: this.activeProvider.name,
        error: error.message
      };
    }
  }
}

