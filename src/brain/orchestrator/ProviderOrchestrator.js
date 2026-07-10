/**
 * ProviderOrchestrator: Manages the registration, loading, and lifecycle
 * of multiple AI providers without directly modifying the DecisionEngine.
 */
export class ProviderOrchestrator {
  constructor() {
    this.activeProviders = new Map();
  }

  registerProvider(providerId, providerInstance) {
    this.activeProviders.set(providerId, providerInstance);
    console.log(`[Orchestrator] Provider registered: ${providerId}`);
  }

  getProvider(providerId) {
    if (!this.activeProviders.has(providerId)) {
      throw new Error(`Provider '${providerId}' is not registered or loaded.`);
    }
    return this.activeProviders.get(providerId);
  }

  getAllRegisteredProviders() {
    return Array.from(this.activeProviders.keys());
  }

  hasProvider(providerId) {
    return this.activeProviders.has(providerId);
  }
}
