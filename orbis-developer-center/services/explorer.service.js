import { runArchitectureScan } from '../utils/explorer.util.js';

export const getProjectArchitecture = () => {
    const report = runArchitectureScan();
    return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        data: report
    };
};
