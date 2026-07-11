/**
 * RecoveryEngine: Ensures system continuity if an AI provider fails.
 * Implements: Retry Logic -> Fallback Provider -> Recovery -> Audit Log -> Final Error.
 */
export class RecoveryEngine {
  constructor(providerRegistry) {
    this.providerRegistry = providerRegistry; // Accepts a Map or Registry of providers
    this.auditLog = [];
  }

  /**
   * Internal logging mechanism for observability
   */
  logEvent(level, action, message, details = {}) {
    const entry = { timestamp: new Date().toISOString(), level, action, message, details };
    this.auditLog.push(entry);
    // In production, this can also log to external dashboards
  }

  /**
   * Executes a task with automatic retries and fallback mechanisms
   */
  async executeWithRecovery(primaryName, fallbackName, taskParams) {
    const maxRetries = 2; // Tries the primary provider a total of 2 times before failing

    // 1. Retry Logic for Primary Provider
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const primaryProvider = this.providerRegistry.get(primaryName);
        if (!primaryProvider) throw new Error(`Provider [${primaryName}] not registered.`);

        this.logEvent('INFO', 'ATTEMPT', `Attempt ${attempt} with primary provider: ${primaryName}`);
        
        // Simulating the execution call to the provider
        const result = await primaryProvider.execute(taskParams);
        
        this.logEvent('SUCCESS', 'EXECUTE', `Task successfully completed by ${primaryName}`);
        return result;
      } catch (error) {
        this.logEvent('WARN', 'RETRY_FAILED', `Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) break; // Move to fallback if max retries reached
        
        // Wait 500ms before retrying (simulating network delay)
        await new Promise(res => setTimeout(res, 500)); 
      }
    }

    // 2. Fallback Provider Logic
    this.logEvent('WARN', 'FALLBACK_INITIATED', `Primary failed. Switching to fallback: ${fallbackName}`);
    try {
      const fallbackProvider = this.providerRegistry.get(fallbackName);
      if (!fallbackProvider) throw new Error(`Fallback Provider [${fallbackName}] not registered.`);

      const fallbackResult = await fallbackProvider.execute(taskParams);
      
      this.logEvent('SUCCESS', 'RECOVERED', `Task successfully recovered by fallback: ${fallbackName}`);
      return fallbackResult;
    } catch (fallbackError) {
      // 3. Final Error if both Primary and Fallback fail
      const finalMessage = `Critical Failure: Both ${primaryName} and ${fallbackName} failed to execute the task.`;
      this.logEvent('ERROR', 'FINAL_FAILURE', finalMessage, { error: fallbackError.message });
      
      throw new Error(finalMessage);
    }
  }

  getAuditLogs() {
    return this.auditLog;
  }
}
