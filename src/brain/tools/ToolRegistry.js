/**
 * ToolRegistry: Handles discovery, loading, and configuration of external tools.
 * Ensures tools are dynamically loaded, preventing hardcoded dependencies.
 */
export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Discovers and loads tools dynamically from a configuration object (or JSON)
   */
  loadFromConfiguration(config) {
    if (!config || !config.tools) return false;
    
    for (const toolDef of config.tools) {
      // Only load tools that are marked as 'active'
      if (toolDef.active) {
        this.tools.set(toolDef.name, {
           description: toolDef.description,
           // Simulated dynamic execution for the architecture foundation
           execute: async (args) => ({ 
             status: 'success', 
             tool: toolDef.name, 
             message: `Successfully executed ${toolDef.name}`,
             args 
           })
        });
      }
    }
    return true;
  }

  getTool(name) {
    return this.tools.get(name) || null;
  }
}
