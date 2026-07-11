import { ToolRegistry } from './ToolRegistry.js';

/**
 * ToolEngine: Provides the "hands" for ORBIS to execute external tasks.
 * Uses Dynamic Tool Registry for loading tools.
 */
export class ToolEngine {
  constructor() {
    this.registry = new ToolRegistry();
  }

  // Load tools dynamically from configuration
  async initialize(config) {
    return this.registry.loadFromConfiguration(config);
  }

  // ==============================================================
  // ⚠️ BACKWARD COMPATIBILITY (For Phase 5 Master Test)
  // ==============================================================
  registerTool(name, toolInstance) {
     this.registry.tools.set(name, toolInstance);
  }

  // Exposing tools Map for Jest backward compatibility
  get tools() {
     return this.registry.tools;
  }
  // ==============================================================

  /**
   * Executes a registered tool by its name
   */
  async executeTool(name, params = {}) {
    const tool = this.registry.getTool(name);
    if (!tool) {
      throw new Error(`Tool [${name}] is not registered or active in the system.`);
    }
    return await tool.execute(params);
  }
}
