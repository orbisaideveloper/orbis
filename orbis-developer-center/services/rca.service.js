import { runRCA } from '../utils/rca.util.js';

export const analyzeRootCause = (query) => {
    if (!query) throw new Error("Search query is missing");
    
    const findings = runRCA(query);

    return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        query: query,
        totalFindings: findings.length,
        data: findings
    };
};
