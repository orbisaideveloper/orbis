/**
 * BaseProvider: All AI providers must implement this interface.
 */
export class BaseProvider {
  constructor(apiKey) {
    if (this.constructor === BaseProvider) {
      throw new Error("BaseProvider cannot be instantiated directly");
    }
    this.apiKey = apiKey;
  }

  // প্রতিটি প্রোভাইডারে এই মেথডটি থাকতে হবে
  async generateResponse(prompt) {
    throw new Error("Method 'generateResponse()' must be implemented.");
  }
}
