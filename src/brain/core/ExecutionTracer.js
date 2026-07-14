import crypto from 'crypto';
import { addLog } from '../telemetry.js'; 

/**
 * ExecutionTracer: Wraps modules to track execution flow and performance.
 * * PHASE 9.1 EXTENSION - Sends real-time telemetry to Developer Dashboard
 */
export class ExecutionTracer {
    // Phase 9.1: Reference to DeveloperDashboard for Central Logs and Inspector
    static dashboard = null;

    // Registers the dashboard so Tracer can send data as an Observer
    static registerDashboard(dashboardInstance) {
        this.dashboard = dashboardInstance;
    }

    static generateTrackId() {
        return `REQ-${crypto.randomUUID().substring(0, 6).toUpperCase()}`;
    }

    static wrap(targetObject, moduleName) {
        return new Proxy(targetObject, {
            get(target, propKey, receiver) {
                const originalMethod = target[propKey];
                
                if (typeof originalMethod === 'function') {
                    return async function (...args) {
                        const trackId = args[0]?.trackId || ExecutionTracer.generateTrackId();
                        if (args[0] && typeof args[0] === 'object' && !args[0].trackId) {
                            args[0].trackId = trackId;
                        }

                        const startTime = Date.now();
                        const enterMsg = `[${trackId}] Entered: ${moduleName} ➔ ${propKey}()`;
                        
                        // 🟢 সেফটি বাইপাস: পুরনো লগ সিস্টেম (Backward Compatibility)
                        try { addLog('INFO', enterMsg); } catch(e) {}

                        // 🟢 PHASE 9.1: Engineering Inspector (Tracking Entry)
                        try {
                            if (ExecutionTracer.dashboard) {
                                ExecutionTracer.dashboard.inspectRequestFlow(trackId, {
                                    module: moduleName,
                                    function: propKey,
                                    action: 'Entered',
                                    execution_time: 0,
                                    status: 'PENDING'
                                });
                            }
                        } catch(e) {} // Silent bypass to prevent flow interruption

                        try {
                            const result = await originalMethod.apply(this, args);
                            const duration = Date.now() - startTime;
                            const successMsg = `[${trackId}] Success: ${moduleName} ➔ ${propKey}() [${duration}ms]`;
                            
                            // 🟢 সেফটি বাইপাস: পুরনো লগ সিস্টেম
                            try { addLog('OK', successMsg); } catch(e) {}

                            // 🟢 PHASE 9.1: Central Logs & Engineering Inspector (Tracking Success)
                            try {
                                if (ExecutionTracer.dashboard) {
                                    ExecutionTracer.dashboard.logEvent(trackId, moduleName, propKey, 'Execution', 'OK', duration, 'INFO');
                                    ExecutionTracer.dashboard.inspectRequestFlow(trackId, {
                                        module: moduleName,
                                        function: propKey,
                                        action: 'Completed',
                                        execution_time: duration,
                                        status: 'SUCCESS'
                                    });
                                }
                            } catch(e) {}

                            return result;
                        } catch (error) {
                            const duration = Date.now() - startTime;
                            const failMsg = `[${trackId}] FAILED: ${moduleName} ➔ ${propKey}() [${duration}ms]`;
                            
                            // 🟢 সেফটি বাইপাস: পুরনো লগ সিস্টেম
                            try { addLog('ERR', failMsg); } catch(e) {}

                            // 🟢 PHASE 9.1: Central Logs & Engineering Inspector (Tracking Error)
                            try {
                                if (ExecutionTracer.dashboard) {
                                    ExecutionTracer.dashboard.logEvent(trackId, moduleName, propKey, 'Execution', 'FAILED', duration, 'ERROR', error.message, error.stack);
                                    ExecutionTracer.dashboard.inspectRequestFlow(trackId, {
                                        module: moduleName,
                                        function: propKey,
                                        action: 'Failed',
                                        execution_time: duration,
                                        status: 'ERROR',
                                        error: error.message
                                    });
                                }
                            } catch(e) {}

                            throw error;
                        }
                    };
                }
                return Reflect.get(target, propKey, receiver);
            }
        });
    }
}
