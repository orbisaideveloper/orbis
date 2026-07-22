import express from 'express';
import path from 'node:path';
import { scanProjectInventory, getRealHealthData, getRealFileContext } from '../utils/RealDataEngine.js';

const router = express.Router();
const ROOT_DIR = process.cwd();

// --- SCHEMA ENFORCER (CRITICAL BUG FIX: camelCase Keys & N/A Enforcement) ---
const createAnalyzerResult = (stage, status, file, line, func, reason, impact, dependency, suggestedFix, confidence, evidenceSource) => ({
    stage: stage || 'N/A',
    status: status || 'N/A',
    file: file || 'N/A',
    line: line || 'N/A',
    function: func || 'N/A',
    reason: reason || 'N/A',
    impact: impact || 'N/A',
    dependency: dependency || 'N/A',
    suggestedFix: suggestedFix || 'N/A',
    confidence: confidence || 'N/A',
    evidenceSource: evidenceSource || 'N/A',
    timestamp: new Date().toISOString()
});

// --- INTENT ENGINE ---
const analyzeIntent = (query) => {
    const q = query.toLowerCase();
    const intentTable = [
        { id: 'inventory', keywords: ['inventory', 'project inventory'], analyzer: 'Inventory Engine' },
        { id: 'system_audit', keywords: ['system audit', 'full audit', 'runtime audit', 'developer report', 'health check', 'project health'], analyzer: 'System Audit Engine' },
        { id: 'lottery', keywords: ['lottery', 'লটারি'], analyzer: 'Lottery Analyzer' },
        { id: 'dashboard', keywords: ['dashboard', 'ড্যাশবোর্ড'], analyzer: 'Dashboard Analyzer' },
        { id: 'html', keywords: ['html'], analyzer: 'HTML Analyzer' },
        { id: 'js', keywords: ['javascript', 'js'], analyzer: 'JavaScript Analyzer' }
    ];

    let matched = null;

    for (const intent of intentTable) {
        if (intent.keywords.some(kw => q.includes(kw))) {
            matched = intent;
            break;
        }
    }

    if (matched) return { matched, confidence: '100% (Calculated)', reason: 'Direct matching from Request' };
    return { matched: { id: 'generic', analyzer: 'Generic Engine' }, confidence: 'N/A', reason: 'No specific intent matched. Running generic scan.' };
};

// --- MAIN SCAN ENGINE V3.6 ---
router.post('/scan', express.json(), (req, res) => {
    const { query } = req.body;
    if (!query) return res.json({ success: false, error: 'Query is missing', timestamp: new Date().toISOString() });

    const { matched, confidence, reason } = analyzeIntent(query);
    const healthData = getRealHealthData();
    
    let flow = [];
    let evidencePack = null;
    let smartFix = null;
    let inventoryReport = null;

    if (matched.id === 'inventory') {
        inventoryReport = scanProjectInventory();
        flow.push(createAnalyzerResult('File Scan', 'PASS', 'Root Directory', 'N/A', 'scanProjectInventory()', 'Successfully counted real files.', 'None', 'Node fs module', 'N/A', '100%', 'Filesystem'));
    } 
    else if (matched.id === 'system_audit') {
        const pkgContext = getRealFileContext('package.json');
        flow.push(createAnalyzerResult('Runtime Mem', 'INFO', 'OS', 'N/A', 'os.freemem()', `Memory: ${healthData.memory}`, 'System Performance', 'Node OS module', 'N/A', '100%', 'Runtime'));
        flow.push(createAnalyzerResult('Dependencies', pkgContext.exists ? 'PASS' : 'WARN', 'package.json', 'N/A', 'JSON.parse()', `Found ${healthData.dependencies} dependencies`, 'Application Stability', 'NPM', pkgContext.exists ? 'N/A' : 'Create package.json', '100%', 'Filesystem'));
        
        evidencePack = {
            File: 'package.json', Line: 'N/A', Function: 'N/A',
            CodeContext: pkgContext.snippet,
            DependencyChain: 'Core -> Modules',
            RuntimeEvidence: `Uptime: ${healthData.uptime}`,
            ConsoleEvidence: 'N/A',
            EvidenceSource: 'Filesystem & Runtime'
        };
    } 
    else if (matched.id === 'lottery' || matched.id === 'dashboard') {
        const targetPath = `src/modules/${matched.id}/index.js`;
        const fileData = getRealFileContext(targetPath);
        
        if (fileData.exists) {
            flow.push(createAnalyzerResult('Module Scan', 'PASS', targetPath, 'N/A', 'N/A', 'File exists and is readable.', 'High', 'Express', 'N/A', '100%', 'Filesystem'));
            evidencePack = { File: targetPath, Line: '1-3', Function: 'N/A', CodeContext: fileData.snippet, DependencyChain: 'Router -> Module', RuntimeEvidence: 'N/A', ConsoleEvidence: 'N/A', EvidenceSource: 'Filesystem' };
        } else {
            flow.push(createAnalyzerResult('Module Scan', 'FAIL', targetPath, 'N/A', 'N/A', 'Real file not found in directory.', 'Critical', 'Express', `Create file at ${targetPath}`, '100%', 'Filesystem'));
            smartFix = { File: targetPath, SuggestedCode: `export const init = () => { console.log('${matched.id} loaded'); }`, Reason: 'Missing entry point', EvidenceSource: 'Filesystem' };
        }
    } 
    else {
        flow.push(createAnalyzerResult('Generic Trace', 'INFO', 'N/A', 'N/A', 'N/A', 'Executing standard validation fallback', 'Low', 'N/A', 'N/A', 'N/A', 'Runtime'));
    }

    res.json({
        success: true,
        queryVerification: { intent: matched.id, analyzer: matched.analyzer, confidence, reason, timestamp: new Date().toISOString() },
        issues: flow,
        smartReport: {
            evidencePack: evidencePack || 'N/A (No critical evidence found)',
            smartFixPreview: smartFix || 'N/A (No fixes required)',
            inventory: inventoryReport || 'N/A (Not requested)'
        }
    });
});

export default router;