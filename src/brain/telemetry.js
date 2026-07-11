import os from 'os';

const systemState = {
    workflowState: 'IDLE',
    errorCount: 0,
    requestCount: 0
};

const getTelemetryData = () => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
        brainHub: {
            status: 'ONLINE',
            uptime: process.uptime().toFixed(0),
            activeWorkflow: systemState.workflowState
        },
        memoryEngine: {
            ramUsageMB: (usedMemory / 1024 / 1024).toFixed(2)
        },
        performance: {
            totalRequests: systemState.requestCount,
            errorCount: systemState.errorCount
        }
    };
};

const updateWorkflowState = (newState) => { systemState.workflowState = newState; };
const logSystemError = () => { systemState.errorCount += 1; };
const logRequest = () => { systemState.requestCount += 1; };

// মডার্ন ES Module Export
export {
    getTelemetryData,
    updateWorkflowState,
    logSystemError,
    logRequest
};
