import { runDeepAudit } from '../utils/audit.util.js';

export const getAuditReport = () => {
    const auditData = runDeepAudit();
    
    // SonarCloud স্টাইল গ্রেডিং (A, B, C, D)
    let securityGrade = auditData.vulnerabilities.length === 0 ? 'A' : (auditData.vulnerabilities.length < 5 ? 'B' : 'C');
    let qualityGate = securityGrade !== 'C' ? 'PASSED' : 'FAILED';

    return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        data: {
            qualityGate,
            securityGrade,
            totalBugs: auditData.bugs.length,
            totalVulnerabilities: auditData.vulnerabilities.length,
            totalCodeSmells: auditData.codeSmells.length,
            duplicationPercentage: auditData.duplications,
            linesScanned: auditData.linesOfCode,
            details: auditData
        }
    };
};
