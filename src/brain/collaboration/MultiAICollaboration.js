/**
 * MultiAICollaboration: Orchestrates multiple AIs to work as a team.
 * Example: Planner (AI-1) -> Coder (AI-2) -> Reviewer (AI-1).
 */
export class MultiAICollaboration {
  constructor(registry, bridge, contextEngine) {
    this.registry = registry;
    this.bridge = bridge;
    this.contextEngine = contextEngine;
    
    // Coordinator decides execution order and provider mapping
    this.roleMapping = {
      'planner': 'openai',     // OpenAI is great at logical planning
      'coder': 'gemini',       // Gemini is fast at drafting code
      'reviewer': 'openai'     // OpenAI is strict at reviewing
    };
  }

  async runWorkflow(taskId, originalPrompt) {
    // 1. Intelligent prompt from Context Engine (Step 04)
    const context = await this.contextEngine.buildContext(taskId, originalPrompt);
    let sharedKnowledge = context.finalPrompt;
    
    const workflowTrace = [];
    const roles = ['planner', 'coder', 'reviewer']; // The Team

    // 2. Sequential Multi-AI execution (AI passing data to AI)
    for (const role of roles) {
      const providerName = this.roleMapping[role];
      const adapter = this.registry.getProvider(providerName);
      
      const rolePrompt = `You are the ${role}.\nBased on this context, do your job:\n${sharedKnowledge}`;
      
      // Execute the AI task
      const response = await this.bridge.dispatch(adapter, rolePrompt);
      
      // 3. Chain the output: Add this AI's output so the NEXT AI can read it
      sharedKnowledge += `\n\n[${role.toUpperCase()} OUTPUT]:\n${response.data}`;
      
      workflowTrace.push({
        role: role,
        provider: providerName,
        output: response.data
      });
    }

    return {
      taskId,
      status: 'success',
      finalOutput: workflowTrace[workflowTrace.length - 1].output,
      workflowTrace
    };
  }
}
