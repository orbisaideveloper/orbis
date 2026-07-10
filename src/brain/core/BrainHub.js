import { ProviderOrchestrator } from '../orchestrator/ProviderOrchestrator.js';
import { DecisionManager } from '../decision/DecisionManager.js';
import { MemoryInterface } from '../memory/MemoryInterface.js';
import { ContextEngine } from '../context/ContextEngine.js';
import { WorkflowEngine } from '../workflow/WorkflowEngine.js';
import { SecurityManager } from '../security/SecurityManager.js';

/**
 * BrainHub: The central facade and main entry point for the ORBIS Brain.
 * It initializes and connects all the individual Lego bricks (modules).
 */
export class BrainHub {
  constructor() {
    this.security = new SecurityManager();
    this.memory = new MemoryInterface();
    this.contextEngine = new ContextEngine();
    this.decision = new DecisionManager();
    this.orchestrator = new ProviderOrchestrator();
    this.workflow = new WorkflowEngine();
    
    console.log('[BrainHub] All core modules initialized successfully.');
  }

  async processRequest(taskInput) {
    this.security.logAudit('process_request', `Received task: ${taskInput}`);
    
    // Future expansion: Here we will route the task using context and decision manager
    return `[BrainHub] Task '${taskInput}' acknowledged and processed.`;
  }
}
