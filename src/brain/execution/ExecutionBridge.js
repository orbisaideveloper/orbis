/**
 * ExecutionBridge: Now completely agnostic. It doesn't know about 'openai' or 'gemini'.
 * It simply receives an Adapter and tells it to execute.
 */
export class ExecutionBridge {
  constructor() {
    this.apiConfigured = false;
  }

  async dispatch(providerAdapter, prompt, context = []) {
    if (!providerAdapter || typeof providerAdapter.execute !== 'function') {
      throw new Error('A valid Provider Adapter is strictly required.');
    }

    // The bridge simply delegates the work to the specific adapter
    return await providerAdapter.execute(prompt, context);
  }
}
