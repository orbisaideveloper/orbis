/**
 * BrainController: Manages runtime configuration and system state.
 */
export class BrainController {
  constructor(initialConfig = {}) {
    // ফাইল থেকে কনফিগ লোড করার পাশাপাশি ইনিশিয়াল কনফিগও হ্যান্ডেল করবে
    this.config = {
      provider: null,
      memoryEnabled: false,
      ...initialConfig
    };
  }

  getActiveConfig() {
    return { ...this.config };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  setProvider(provider) {
    this.config.provider = provider;
  }

  setMemoryStatus(status) {
    this.config.memoryEnabled = !!status;
  }
}
