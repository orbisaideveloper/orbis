/**
 * DeveloperDashboard: Generates a real-time snapshot of the ORBIS engineering infrastructure.
 * Strictly for developer observability and debugging.
 */
export class DeveloperDashboard {
  constructor(systemModules = {}) {
    this.memoryEngine = systemModules.memory || null;
    this.toolEngine = systemModules.tools || null;
    this.recoveryEngine = systemModules.recovery || null;
    this.decisionManager = systemModules.decision || null;
  }

  /**
   * Generates a comprehensive real-time system snapshot
   */
  generateSystemSnapshot() {
    return {
      timestamp: new Date().toISOString(),
      system_status: 'ONLINE',
      
      // 1. Provider & Decision Status
      decision_manager: {
        status: this.decisionManager ? 'ACTIVE' : 'STANDBY',
        current_context: 'System awaiting developer input',
        planner_output: 'Idle'
      },

      // 2. Workflow & Running Tools
      tool_engine: {
        status: this.toolEngine ? 'ACTIVE' : 'OFFLINE',
        registered_tools: this.toolEngine ? Array.from(this.toolEngine.tools.keys()) : [],
        running_tools: 0 // Mocked for current state
      },

      // 3. Memory Status
      memory_status: {
        status: this.memoryEngine ? 'ACTIVE' : 'OFFLINE',
        active_users: this.memoryEngine ? this.memoryEngine.userMemory.size : 0,
        active_projects: this.memoryEngine ? this.memoryEngine.projectMemory.size : 0,
        conversation_length: this.memoryEngine ? this.memoryEngine.history.length : 0
      },

      // 4. Errors, Retry Status & Audit Log
      recovery_system: {
        status: this.recoveryEngine ? 'ACTIVE' : 'OFFLINE',
        audit_logs: this.recoveryEngine ? this.recoveryEngine.getAuditLogs() : [],
        total_errors_caught: this.recoveryEngine ? this.recoveryEngine.getAuditLogs().filter(log => log.level === 'ERROR' || log.level === 'WARN').length : 0
      }
    };
  }

  /**
   * Helper to print a clean console dashboard for terminal debugging
   */
  printDashboard() {
    const snapshot = this.generateSystemSnapshot();
    console.log('====================================================');
    console.log('       🛠️ ORBIS DEVELOPER DASHBOARD 🛠️             ');
    console.log('====================================================');
    console.log(`STATUS: ${snapshot.system_status} | TIME: ${snapshot.timestamp}`);
    console.log(`MEMORY: ${snapshot.memory_status.status} | TOOLS: ${snapshot.tool_engine.registered_tools.length} loaded`);
    console.log(`RECOVERY LOGS: ${snapshot.recovery_system.audit_logs.length} entries | ERRORS CAUGHT: ${snapshot.recovery_system.total_errors_caught}`);
    console.log('====================================================');
    return snapshot;
  }
}
