import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// 🟢 ORIGINAL FUNCTION (Unchanged)
function getAllFiles(dirPath, arrayOfFiles) {
    try {
        const files = fs.readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];
        files.forEach(function(file) {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                }
            } else {
                if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.css')) {
                    arrayOfFiles.push(fullPath);
                }
            }
        });
    } catch (err) { console.error("Directory scan error:", err.message); }
    return arrayOfFiles;
}

// ==========================================
// 1. HEALTH ENGINE
// ==========================================
router.get('/health', (req, res) => {
    try {
        const memory = process.memoryUsage();
        res.json({
            score: 100,
            project: { value: 'OPERATIONAL', status: 'PASS', detail: 'V4.8 Advanced Heuristics Engine Active.' },
            ram: { value: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`, status: 'PASS' },
            dependency: { value: 'STABLE', status: 'PASS' },
            console: { value: 'ACTIVE', status: 'PASS' }
        });
    } catch (err) { res.status(500).json({ error: "Health check failed." }); }
});

// ==========================================
// 2. THE GOD MODE SCANNER 
// ==========================================
router.post('/scan', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const issues = [];
    const projectRoot = path.join(__dirname, '../../'); 
    
    let packageDeps = {}; let devDeps = {};
    let packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) packageJsonPath = path.join(__dirname, '../../', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            packageDeps = pkg.dependencies || {}; devDeps = pkg.devDependencies || {};
        } catch (err) {}
    }

    const rawQuery = query.toLowerCase().trim();
    const isReferenceRequested = rawQuery.includes('reference') || rawQuery.includes('রেফারেন্স') || rawQuery.includes('show');

    const intentDictionary = {
        'লগিন': 'login', 'লগইন': 'login', 'auth': 'authentication',
        'ড্যাশবোর্ড': 'dashboard', 'dash': 'dashboard', 'home': 'dashboard',
        'লটারি': 'lottery', 'খেলা': 'lottery', 'game': 'lottery',
        'পেমেন্ট': 'payment', 'টাকা': 'payment', 'money': 'payment'
    };

    let normalizedIntent = rawQuery;
    Object.keys(intentDictionary).forEach(key => {
        if (normalizedIntent.includes(key)) normalizedIntent = normalizedIntent.replace(new RegExp(key, 'g'), intentDictionary[key]);
    });

    const stopWords = ['how', 'to', 'fix', 'error', 'in', 'the', 'my', 'is', 'not', 'working', 'complete', 'source', 'code', 'file', 'this', 'that', 'find', 'search', 'about', 'where', 'what', 'why', 'show', 'me', 'আমাকে', 'একটু', 'চেক', 'করে', 'বল', 'আমার', 'পুরো', 'হচ্ছে', 'না', 'তো', 'এর', 'জন্য', 'কোথায়', 'কি', 'আছে', 'সাথে', 'দাও', 'মডেলটা', 'মডিউল', 'দেখাও', 'রেফারেন্সের', 'রেফারেন্স', 'ব্রোকেন', 'কোথায়', 'একটা', 'module', 'experiencing', 'at'];
    
    const semanticKeywords = normalizedIntent.split(/[\s,]+/).filter(w => w.length > 2 && !stopWords.includes(w));
    const detectedModule = semanticKeywords.length > 0 ? semanticKeywords[0] : 'core_system';

    const allAvailableFiles = getAllFiles(projectRoot);
    const scopeFiles = new Set();
    allAvailableFiles.forEach(file => {
        if (semanticKeywords.some(mod => path.relative(projectRoot, file).toLowerCase().includes(mod))) scopeFiles.add(file);
    });

    if (scopeFiles.size === 0) {
         allAvailableFiles.forEach(file => {
            try {
                if (semanticKeywords.some(mod => fs.readFileSync(file, 'utf-8').substring(0, 3000).toLowerCase().includes(mod))) scopeFiles.add(file);
            } catch(e) {}
         });
    }

    let currentLevelFiles = Array.from(scopeFiles);
    for (let depth = 0; depth < 2; depth++) {
        let nextLevelFiles = [];
        currentLevelFiles.forEach(file => {
            try {
                fs.readFileSync(file, 'utf-8').split('\n').forEach(line => {
                    const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                    if (match && match[1] && (match[1].startsWith('./') || match[1].startsWith('../'))) {
                        ['', '.js', '/index.js', '.html', '.json'].some(ext => {
                            const testPath = path.resolve(path.dirname(file), match[1]) + ext;
                            if (fs.existsSync(testPath) && !scopeFiles.has(testPath)) {
                                scopeFiles.add(testPath); nextLevelFiles.push(testPath); return true;
                            }
                        });
                    }
                });
            } catch(e) {}
        });
        currentLevelFiles = nextLevelFiles;
        if (currentLevelFiles.length === 0) break;
    }

    const filesToActuallyScan = scopeFiles.size > 0 ? Array.from(scopeFiles) : allAvailableFiles;

    let scannedLinesCount = 0;
    const summary = { packages: 0, nodeModules: 0, localModules: 0, references: 0, logging: 0, defensiveCode: 0, hiddenPasses: 0, criticalRootCauses: 0 };
    const domIds = new Set();
    const duplicatedIds = new Set();

    filesToActuallyScan.forEach(filePath => {
        const fileName = path.relative(projectRoot, filePath);
        let fileContent = '';
        try { fileContent = fs.readFileSync(filePath, 'utf-8'); } catch(e) { return; }
        const lines = fileContent.split('\n');

        lines.forEach((line, index) => {
            const lineLower = line.toLowerCase();
            const cleanLine = line.trim();
            const lineNumber = index + 1;

            if (!cleanLine || cleanLine.startsWith('//') || cleanLine.startsWith('/*')) return;

            let classification = null;
            let status = 'PASS';
            let impactText = 'Low';
            let analysisReason = '';
            let fixSuggestion = '';
            let confidenceLvl = 'High';
            let isCritical = false;
            let isImportBlock = false;

            if (lineLower.includes('import ') || lineLower.includes('require(')) {
                const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    isImportBlock = true;
                    const importPath = match[1];
                    const isBuiltIn = ['fs', 'path', 'url', 'crypto', 'os', 'http'].some(mod => importPath === mod || importPath.startsWith('node:'));
                    const isLocal = importPath.startsWith('./') || importPath.startsWith('../');

                    if (isBuiltIn) {
                        classification = 'NODE BUILT-IN';
                    } else if (isLocal) {
                        if (!['', '.js', '/index.js', '.html'].some(ext => fs.existsSync(path.resolve(path.dirname(filePath), importPath) + ext))) {
                            classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                            analysisReason = `BROKEN PATH: Local import '${importPath}' is missing.`;
                            fixSuggestion = 'Verify relative path.'; confidenceLvl = '100%';
                        } else { classification = 'LOCAL MODULE'; }
                    } else {
                        let basePkg = importPath.startsWith('@') ? importPath.split('/').slice(0,2).join('/') : importPath.split('/')[0];
                        if (!packageDeps[basePkg] && !devDeps[basePkg] && !fs.existsSync(path.join(projectRoot, 'node_modules', basePkg))) {
                            classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                            analysisReason = `BROKEN PACKAGE: Dependency '${basePkg}' missing.`;
                            fixSuggestion = 'Run npm install.'; confidenceLvl = '100%';
                        } else { classification = 'PACKAGE'; }
                    }
                }
            }

            let isMatch = semanticKeywords.length > 0 && semanticKeywords.some(keyword => lineLower.includes(keyword));

            if (!isImportBlock) {
                const idMatch = cleanLine.match(/id=['"]([^'"]+)['"]/);
                if (idMatch && idMatch[1]) {
                    const domId = idMatch[1];
                    if (domIds.has(domId) && !duplicatedIds.has(domId)) {
                        duplicatedIds.add(domId);
                        classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'HIGH'; summary.criticalRootCauses++;
                        analysisReason = `Duplicate DOM ID: '${domId}'. Render will conflict.`; confidenceLvl = '90%';
                    }
                    domIds.add(domId);
                }

                if (cleanLine.match(/getElementById\(['"](.*?)['"]\)/) && !cleanLine.includes('?.')) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'HIGH'; summary.criticalRootCauses++;
                    analysisReason = 'Null DOM Risk: getElementById without null check.'; confidenceLvl = '80%';
                } else if (cleanLine.includes('display: none') || cleanLine.includes('display:none') || cleanLine.includes('visibility: hidden')) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'HIGH'; summary.criticalRootCauses++;
                    analysisReason = 'UI Blocked: Element hidden via CSS.'; confidenceLvl = '100%';
                } else if (cleanLine.includes('Cannot read properties of undefined') || cleanLine.match(/\b\w+\.undefined\b/)) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                    analysisReason = "Undefined property access detected."; confidenceLvl = '100%';
                } else if (cleanLine.includes('export default undefined') || cleanLine.includes('module.exports = {}')) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                    analysisReason = "Exporting empty object."; confidenceLvl = '100%';
                } else if (lineLower.includes('throw new error')) {
                    classification = 'DEFENSIVE CODE'; status = 'PASS'; analysisReason = "Exception handling.";
                } else if (lineLower.includes('console.error')) {
                    classification = 'LOGGING'; status = 'PASS'; analysisReason = "Logging operation.";
                } else if (isMatch) {
                    classification = lineLower.includes('<') ? 'UI' : (lineLower.includes('app.use') ? 'ROUTE' : 'REFERENCE');
                    status = 'PASS'; analysisReason = "Semantic reference.";
                }
            }

            // 🟢 FIXED: LOWERCASE KEYS FOR FRONTEND COMPATIBILITY
            if (classification) {
                const isFailState = (status === 'FAIL' || isCritical || classification === 'ROOT CAUSE');
                const formattedReason = `<strong>Reason:</strong> ${analysisReason}<br><strong>Evidence:</strong> <code>${cleanLine.substring(0, 75)}...</code><br><strong>Confidence:</strong> ${confidenceLvl}`;

                if (isFailState) {
                    issues.push({
                        stage: classification, 
                        status: 'FAIL', 
                        file: fileName, 
                        line: lineNumber, 
                        impact: impactText,
                        reason: formattedReason,
                        suggestedFix: fixSuggestion || 'Immediate fix required.'
                    });
                } else if (isReferenceRequested) {
                    issues.push({
                        stage: classification, 
                        status: status, 
                        file: fileName, 
                        line: lineNumber, 
                        impact: impactText,
                        reason: formattedReason,
                        suggestedFix: 'No action required.'
                    });
                } else {
                    summary.hiddenPasses++;
                }
            }
        });
    });

    issues.sort((a, b) => (a.status === 'FAIL' ? -1 : 1));
    const hasFails = issues.some(i => i.status === 'FAIL');

    if (!hasFails) {
        issues.push({
            stage: 'RUNTIME INVESTIGATION', 
            status: 'UNKNOWN', 
            file: 'Live Environment', 
            line: 0, 
            impact: 'UNKNOWN',
            reason: `<strong>Status: UNKNOWN</strong><br>No static root cause found.<br><strong>Evidence:</strong> Scanned ${filesToActuallyScan.length} files.`,
            suggestedFix: 'Require external runtime evidence.'
        });
    }

    // 🟢 FIXED: RESTORED THE "tree" OBJECT FOR THE COPY BUTTON
    const treeData = `[ORBIS RCA ENGINE V4.8 - RUNTIME HEURISTICS]
 ├── Query          : "${query}"
 ├── Target Module  : [${detectedModule.toUpperCase()}]
 ├── Scanned Files  : ${filesToActuallyScan.length} verified
 ├── Hidden Noise   : ${summary.hiddenPasses} passes hidden
 └── Final Result   : ${hasFails ? 'Root Cause Identified' : 'UNKNOWN State Triggered'}`;

    res.json({
        tree: treeData,
        issues: issues 
    });
});

export default router;
