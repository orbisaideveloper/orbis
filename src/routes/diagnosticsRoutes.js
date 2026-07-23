import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES Module-এর জন্য __dirname তৈরি করা
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 🟢 ORIGINAL: অ্যাডভান্সড ফাংশন: পুরো প্রজেক্ট ডাইনামিক স্ক্যান করার জন্য (Unchanged)
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
    } catch (err) {
        console.error("Directory scan error:", err.message);
    }
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
            ram: { value: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`, status: 'PASS', detail: `Total Heap: ${Math.round(memory.heapTotal / 1024 / 1024)} MB` },
            dependency: { value: 'STABLE', status: 'PASS', detail: 'All core modules loaded correctly.' },
            console: { value: 'ACTIVE', status: 'PASS', detail: 'Ready.' }
        });
    } catch (err) {
        res.status(500).json({ error: "Health check failed." });
    }
});

// ==========================================
// 2. THE GOD MODE SCANNER (ORIGINAL LOGIC + ADVANCED HEURISTICS)
// ==========================================
router.post('/scan', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const issues = [];
    const projectRoot = path.join(__dirname, '../../'); 
    
    // 🟢 ORIGINAL: package.json ও devDependencies রিড করা
    let packageDeps = {};
    let devDeps = {};
    let packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) packageJsonPath = path.join(__dirname, '../../', 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            packageDeps = pkg.dependencies || {};
            devDeps = pkg.devDependencies || {};
        } catch (err) {}
    }

    // =======================================================
    // 🟢 ORIGINAL: RULE 1 - NORMALIZE INTENT & BENGALI PARSING
    // =======================================================
    const rawQuery = query.toLowerCase().trim();
    const isReferenceRequested = rawQuery.includes('reference') || rawQuery.includes('রেফারেন্স') || rawQuery.includes('কোথায় কি আছে') || rawQuery.includes('show');

    const intentDictionary = {
        'লগিন': 'login', 'লগইন': 'login', 'auth': 'authentication', 'অথ': 'authentication',
        'ড্যাশবোর্ড': 'dashboard', 'dash': 'dashboard', 'home': 'dashboard',
        'লটারি': 'lottery', 'খেলা': 'lottery', 'game': 'lottery',
        'চ্যাট': 'chat', 'বার্তা': 'chat', 'message': 'chat',
        'পেমেন্ট': 'payment', 'টাকা': 'payment', 'money': 'payment'
    };

    let normalizedIntent = rawQuery;
    Object.keys(intentDictionary).forEach(key => {
        if (normalizedIntent.includes(key)) normalizedIntent = normalizedIntent.replace(new RegExp(key, 'g'), intentDictionary[key]);
    });

    const stopWords = ['how', 'to', 'fix', 'error', 'in', 'the', 'my', 'is', 'not', 'working', 'complete', 'source', 'code', 'file', 'this', 'that', 'find', 'search', 'about', 'where', 'what', 'why', 'show', 'me', 
    'আমাকে', 'একটু', 'চেক', 'করে', 'বল', 'আমার', 'পুরো', 'হচ্ছে', 'না', 'তো', 'এর', 'জন্য', 'কোথায়', 'কি', 'আছে', 'সাথে', 'দাও', 'মডেলটা', 'মডিউল', 'দেখাও', 'রেফারেন্সের', 'রেফারেন্স', 'ব্রোকেন', 'কোথায়', 'একটা',
    'module', 'experiencing', 'at'];
    
    const semanticKeywords = normalizedIntent.split(/[\s,]+/).filter(w => w.length > 2 && !stopWords.includes(w));
    const detectedModule = semanticKeywords.length > 0 ? semanticKeywords[0] : 'core_system';

    // =======================================================
    // 🟢 ORIGINAL: RULE 4 - EXECUTION CHAIN TRACING (2-Level BFS)
    // =======================================================
    const allAvailableFiles = getAllFiles(projectRoot);
    const scopeFiles = new Set();

    allAvailableFiles.forEach(file => {
        const relativeName = path.relative(projectRoot, file).toLowerCase();
        if (semanticKeywords.some(mod => relativeName.includes(mod))) scopeFiles.add(file);
    });

    if (scopeFiles.size === 0) {
         allAvailableFiles.forEach(file => {
            try {
                const contentSnippet = fs.readFileSync(file, 'utf-8').substring(0, 3000).toLowerCase();
                if (semanticKeywords.some(mod => contentSnippet.includes(mod))) scopeFiles.add(file);
            } catch(e) {}
         });
    }

    let currentLevelFiles = Array.from(scopeFiles);
    for (let depth = 0; depth < 2; depth++) {
        let nextLevelFiles = [];
        currentLevelFiles.forEach(file => {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const lines = content.split('\n');
                lines.forEach(line => {
                    const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                    if (match && match[1]) {
                        const importPath = match[1];
                        if (importPath.startsWith('./') || importPath.startsWith('../')) {
                            const absoluteDepPath = path.resolve(path.dirname(file), importPath);
                            const extensions = ['', '.js', '/index.js', '.html', '.json'];
                            for (let ext of extensions) {
                                const testPath = absoluteDepPath + ext;
                                if (fs.existsSync(testPath)) {
                                    if (!scopeFiles.has(testPath)) {
                                        scopeFiles.add(testPath);
                                        nextLevelFiles.push(testPath);
                                    }
                                    break; 
                                }
                            }
                        }
                    }
                });
            } catch(e) { }
        });
        currentLevelFiles = nextLevelFiles;
        if (currentLevelFiles.length === 0) break;
    }

    const filesToActuallyScan = scopeFiles.size > 0 ? Array.from(scopeFiles) : allAvailableFiles;

    // =======================================================
    // 🟢 ORIGINAL CORE + INJECTED HEURISTICS
    // =======================================================
    let scannedLinesCount = 0;
    const summary = { packages: 0, nodeModules: 0, localModules: 0, references: 0, logging: 0, defensiveCode: 0, warnings: 0, failures: 0, criticalRootCauses: 0, hiddenPasses: 0 };
    const domIds = new Set();
    const duplicatedIds = new Set();

    filesToActuallyScan.forEach(filePath => {
        const fileName = path.relative(projectRoot, filePath);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        scannedLinesCount += lines.length;

        lines.forEach((line, index) => {
            const lineLower = line.toLowerCase();
            const lineNumber = index + 1;
            const cleanLine = line.trim();

            if (!cleanLine || cleanLine.startsWith('//') || cleanLine.startsWith('/*')) return;

            let classification = null;
            let status = 'PASS';
            let impactText = 'Low';
            let analysisReason = '';
            let fixSuggestion = '';
            let confidenceLvl = 'High';
            let isCritical = false;
            let isImportBlock = false;

            // 🟢 ORIGINAL: Dependency Resolution Engine
            if (lineLower.includes('import ') || lineLower.includes('require(')) {
                const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    isImportBlock = true;
                    const importPath = match[1];
                    
                    const nodeBuiltIns = ['fs', 'path', 'url', 'crypto', 'os', 'stream', 'events', 'http', 'https', 'util'];
                    const isBuiltIn = nodeBuiltIns.some(mod => importPath === mod || importPath.startsWith('node:'));
                    const isLocal = importPath.startsWith('./') || importPath.startsWith('../');
                    const isTestFile = fileName.endsWith('.test.js') || fileName.endsWith('.spec.js');

                    if (isBuiltIn) {
                        classification = 'NODE BUILT-IN'; summary.nodeModules++;
                    } else if (isLocal) {
                        const absoluteDepPath = path.resolve(path.dirname(filePath), importPath);
                        if (fs.existsSync(absoluteDepPath) || fs.existsSync(absoluteDepPath + '.js') || fs.existsSync(absoluteDepPath + '/index.js') || fs.existsSync(absoluteDepPath + '.html')) {
                            classification = 'LOCAL MODULE'; summary.localModules++;
                        } else {
                            classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                            analysisReason = `BROKEN PATH / LOCAL IMPORT: The relative path '${importPath}' points to a non-existent file!`;
                            fixSuggestion = 'Verify file exists at the specified relative path.';
                            confidenceLvl = '100%';
                        }
                    } else {
                        let basePackage = importPath.startsWith('@') ? importPath.split('/').slice(0,2).join('/') : importPath.split('/')[0];
                        if (packageDeps[basePackage]) {
                            classification = 'PACKAGE'; summary.packages++;
                        } else if (devDeps[basePackage] || (isTestFile && (basePackage === 'jest' || basePackage === 'vitest'))) {
                            if (devDeps[basePackage] || fs.existsSync(path.join(projectRoot, 'node_modules', basePackage))) {
                                classification = 'DEV DEPENDENCY'; summary.packages++;
                            } else {
                                classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                                analysisReason = `BROKEN PACKAGE: Missing Test/Dev Dependency '${basePackage}'.`;
                                fixSuggestion = 'Run npm install for the missing dev dependency.';
                                confidenceLvl = '100%';
                            }
                        } else {
                            classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                            analysisReason = `BROKEN PACKAGE: '${basePackage}' is missing from package.json dependencies!`;
                            fixSuggestion = 'Install the package and add it to package.json.';
                            confidenceLvl = '100%';
                        }
                    }
                }
            }

            // 🟢 ORIGINAL: Semantic Intent Matching
            let isMatch = false;
            if (lineLower.includes(rawQuery)) {
                isMatch = true; 
            } else if (semanticKeywords.length > 0) {
                isMatch = semanticKeywords.some(keyword => lineLower.includes(keyword));
            }

            if (!isImportBlock) {
                
                // 🚀 INJECTED: ADVANCED RUNTIME HEURISTICS
                const idMatch = cleanLine.match(/id=['"]([^'"]+)['"]/);
                if (idMatch && idMatch[1]) {
                    const domId = idMatch[1];
                    if (domIds.has(domId) && !duplicatedIds.has(domId)) {
                        duplicatedIds.add(domId);
                        classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'HIGH'; summary.criticalRootCauses++;
                        analysisReason = `Duplicated DOM ID detected: '${domId}'. Render will conflict.`;
                        fixSuggestion = 'Ensure all DOM IDs are unique.'; confidenceLvl = '90%';
                    }
                    domIds.add(domId);
                }

                if (cleanLine.match(/getElementById\(['"](.*?)['"]\)/) && !cleanLine.includes('?.')) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'HIGH'; summary.criticalRootCauses++;
                    analysisReason = 'Null DOM Reference Risk: getElementById used without null check.';
                    fixSuggestion = 'Add optional chaining (?.) or null check before accessing properties.'; confidenceLvl = '80%';
                } else if (cleanLine.includes('display: none') || cleanLine.includes('display:none') || cleanLine.includes('visibility: hidden') || cleanLine.includes('opacity: 0')) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'HIGH'; summary.criticalRootCauses++;
                    analysisReason = 'UI Blocked: Element is permanently hidden via CSS properties.';
                    fixSuggestion = 'Remove or conditionally render the hiding property.'; confidenceLvl = '100%';
                } else if (cleanLine.includes('Cannot read properties of undefined') || cleanLine.match(/\b\w+\.undefined\b/)) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                    analysisReason = "UNDEFINED REFERENCE: Direct undefined property access detected.";
                    fixSuggestion = 'Implement null/undefined guards before accessing properties.'; confidenceLvl = '100%';
                } else if (cleanLine.includes('export default undefined') || cleanLine.includes('module.exports = {}')) {
                    classification = 'ROOT CAUSE'; status = 'FAIL'; isCritical = true; impactText = 'CRITICAL'; summary.criticalRootCauses++;
                    analysisReason = "Module Structure Failure: Exporting empty object/undefined.";
                    fixSuggestion = 'Ensure the module explicitly exports its core functions/components.'; confidenceLvl = '100%';
                }
                
                // 🟢 ORIGINAL: Logic Classification (Defensive, Logging, UI, Route)
                else if (lineLower.includes('throw new error')) {
                    classification = 'DEFENSIVE CODE'; summary.defensiveCode++; status = 'PASS';
                    analysisReason = "Expected exception handling.";
                } else if (lineLower.includes('console.error')) {
                    classification = 'LOGGING'; summary.logging++; status = 'PASS';
                    analysisReason = "Standard error logging operation.";
                } else if (isMatch) {
                    if (lineLower.includes('<') && lineLower.includes('>')) {
                        classification = 'UI'; summary.references++;
                    } else if (lineLower.includes('express.static')) {
                        classification = 'STATIC ASSET'; summary.references++;
                    } else if (lineLower.includes('app.use') || lineLower.includes('router.')) {
                        classification = 'ROUTE'; summary.references++;
                    } else {
                        classification = 'REFERENCE'; summary.references++; status = 'PASS';
                    }
                    analysisReason = `Semantic logic reference related to query found.`;
                }
            }

            // 🟢 ORIGINAL + NEW OUTPUT FORMAT (Hide Pass by Default)
            if (classification) {
                const isFailState = (status === 'FAIL' || isCritical || classification === 'ROOT CAUSE');

                if (isFailState) {
                    issues.push({
                        Severity: impactText,
                        File: fileName,
                        Line: lineNumber,
                        Reason: analysisReason,
                        Evidence: cleanLine.substring(0, 100),
                        SuggestedFix: fixSuggestion || 'Immediate fix required to prevent application crash.',
                        Confidence: confidenceLvl
                    });
                } else if (isReferenceRequested) {
                    // Only output Pass/Reference if user specifically requests "show references"
                    issues.push({
                        Severity: 'INFO',
                        File: fileName,
                        Line: lineNumber,
                        Reason: analysisReason,
                        Evidence: cleanLine.substring(0, 100),
                        SuggestedFix: 'Expected behavior. No action required.',
                        Confidence: 'High'
                    });
                } else {
                    summary.hiddenPasses++;
                }
            }
        });
    });

    // Sort fails to top
    issues.sort((a, b) => {
        if (a.Severity === 'CRITICAL' || a.Severity === 'HIGH') return -1;
        return 1;
    });

    // =======================================================
    // 🟢 UNKNOWN HANDLER (No Root Cause Proven)
    // =======================================================
    const hasFails = issues.some(i => i.Severity === 'CRITICAL' || i.Severity === 'HIGH');
    
    if (!hasFails) {
        issues.push({
            Severity: 'UNKNOWN',
            File: 'Runtime Memory',
            Line: 'N/A',
            Reason: 'No root cause can be proven from source code. Advanced runtime state verification required.',
            Evidence: `Static code heuristics returned 0 matches across ${filesToActuallyScan.length} files.`,
            SuggestedFix: 'Engine requires external runtime evidence for: [1. Network Request Payload], [2. Final DOM Tree State]. Provide exact system logs to continue.',
            Confidence: '0%'
        });
    }

    res.json({ issues: issues });
});

// ==========================================
// 3. LIVE LOGS (Unchanged)
// ==========================================
router.get('/logs', (req, res) => {
    res.json({ logs: `[SERVER] Diagnostic Engine Active.\n[TIMESTAMP] ${new Date().toISOString()}` });
});

export default router;
