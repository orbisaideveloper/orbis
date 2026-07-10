/**
 * BaseProvider: The interface/blueprint that every future AI provider must follow.
 * Ensures the ExecutionBridge can talk to any AI without knowing its specific rules.
 */
export class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Every adapter must implement this method.
   */
  async execute(prompt, context) {
    throw new Error(`Provider [${this.name}] must implement the execute() method.`);
  }
}
