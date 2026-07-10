/**
 * ProviderRegistry: Holds all registered AI adapters.
 * Adding a new AI in the future only requires registering it here.
 */
export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(providerInstance) {
    if (!providerInstance || !providerInstance.name) {
      throw new Error('Invalid provider instance.');
    }
    this.providers.set(providerInstance.name, providerInstance);
  }

  getProvider(name) {
    if (!this.providers.has(name)) {
      throw new Error(`Provider [${name}] is not registered.`);
    }
    return this.providers.get(name);
  }
}
