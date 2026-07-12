import os from 'os';

const sys = { state: 'IDLE', errs: 0, reqs: 0 };

export const getTelemetryData = () => {
    return {
        brainHub: {
            status: 'ONLINE',
            uptime: process.uptime().toFixed(0),
            activeWorkflow: sys.state
        },
        memoryEngine: {
            ramUsageMB: ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2)
        },
        performance: {
            totalRequests: sys.reqs,
            errorCount: sys.errs
        }
    };
};

export const updateWorkflowState = (s) => sys.state = s;
export const logSystemError = () => sys.errs++;
export const logRequest = () => sys.reqs++;
