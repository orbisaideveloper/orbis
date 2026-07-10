/**
 * MultiAICollaboration: Orchestrates multiple AIs to work as a team.
 * Example: Planner (AI-1) -> Coder (AI-2) -> Reviewer (AI-1).
 */
export class MultiAICollaboration {
  constructor(registry, contextEngine) {
    this.registry = registry;
    this.contextEngine = contextEngine;
    
    // Coordinator decides execution order and provider mapping
    this.roleMapping = {
      'planner': 'openai',     // OpenAI plans the logic
      'coder': 'gemini',       // Gemini writes the code
      'reviewer': 'openai'     // OpenAI reviews for bugs
    };
  }

  async runWorkflow(taskId, originalPrompt) {
    const context = await this.contextEngine.buildContext(taskId, originalPrompt);
    let sharedKnowledge = context.finalPrompt;
    
    const workflowTrace = [];
    const roles = ['planner', 'coder', 'reviewer']; // The AI Team

    for (const role of roles) {
      const providerName = this.roleMapping[role];
      const adapter = this.registry.getProvider(providerName);
      
      const rolePrompt = `You are the ${role}.\nBased on this context, do your job:\n${sharedKnowledge}`;
      
      // Directly execute via adapter (bypassing the old bridge for seamless teamwork)
      const response = await adapter.execute(rolePrompt);
      
      // Chain the output: Add this AI's output so the NEXT AI can read it
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
