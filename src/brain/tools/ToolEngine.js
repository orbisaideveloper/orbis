/**
 * ToolEngine: The execution platform that gives ORBIS "hands".
 * Manages external tool adapters (e.g., GitHub, Supabase, MCP Tools).
 */
export class ToolEngine {
  constructor() {
    this.tools = new Map(); // Tool registry
  }

  /**
   * Registers a new tool adapter to the engine.
   */
  registerTool(toolName, toolAdapter) {
    if (!toolName || !toolAdapter) {
      throw new Error('Tool name and adapter are required.');
    }
    this.tools.set(toolName.toLowerCase(), toolAdapter);
  }

  /**
   * Executes a registered tool with the given parameters.
   */
  async executeTool(toolName, parameters = {}) {
    const name = toolName.toLowerCase();
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool [${toolName}] is not registered in the ToolEngine.`);
    }

    try {
      // Execute the external tool safely
      return await tool.execute(parameters);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
