import { BaseProvider } from './BaseProvider.js';

export class GeminiProvider extends BaseProvider {
  constructor() {
    super('gemini');
    // Security Rule: API Key কোডের ভেতর লেখা যাবে না। এটি এনভায়রনমেন্ট থেকে আসবে।
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async execute(task, context = {}) {
    if (!this.apiKey) {
      console.warn("[GeminiProvider] Warning: API Key is missing. Running in simulation mode.");
      // গিটহাব অ্যাকশনস যেন ফেইল না করে, তাই API key না থাকলে একটি ডামি উত্তর দেবে
      return {
        success: true,
        provider: this.name,
        data: `[Simulated Gemini Response] I received your task: "${task}". (Add API Key to see real response)`,
        timestamp: new Date().toISOString()
      };
    }

    try {
      console.log(`[GeminiProvider] Connecting to real Google Gemini API...`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: task }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.candidates[0].content.parts[0].text;

      return {
        success: true,
        provider: this.name,
        data: reply,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`[GeminiProvider] Execution failed:`, error.message);
      return {
        success: false,
        provider: this.name,
        error: error.message
      };
    }
  }
}
