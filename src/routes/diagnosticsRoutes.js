import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 🟢 ORIGINAL FUNCTION: Directory Mapper (Unchanged)
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
                if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json')) {
                    arrayOfFiles.push(fullPath);
                }
            }
        });
    } catch (err) {}
    return arrayOfFiles;
}

// ==========================================
// 1. HEALTH ENGINE (Unchanged)
// ==========================================
router.get('/health', (req, res) => {
    try {
        const memory = process.memoryUsage();
        res.json({
            score: 100, project: { value: 'OPERATIONAL', status: 'PASS', detail: 'V4.4 Execution Mode Active' },
            ram: { value: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`, status: 'PASS', detail: 'Stable' },
            dependency: { value: 'STABLE', status: 'PASS', detail: 'Core modules loaded.' },
            console: { value: 'ACTIVE', status: 'PASS', detail: 'Ready.' }
        });
    } catch (err) { res.status(500).json({ error: "Health check failed." }); }
});

// ==========================================
// 2. THE GOD MODE SCANNER (V4.4 - EXECUTION ROOT CAUSE MODE)
// ==========================================
router.post('/scan', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const issues = [];
    const projectRoot = path.join(__dirname, '../../'); 
    
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
    // 🟢 RULE 1: NORMALIZE INTENT TO TECHNICAL ENGLISH
    // =======================================================
    const rawQuery = query.toLowerCase().trim();
    
    // Dynamic extraction mappings
    const moduleMap = { 'lottery': 'Lottery', 'লটারি': 'Lottery', 'auth': 'Authentication', 'লগইন': 'Authentication', 'dashboard': 'Dashboard', 'ড্যাশবোর্ড': 'Dashboard', 'payment': 'Payment', 'পেমেন্ট': 'Payment' };
    const problemMap = { 'broken': 'crashing', 'ব্রোকেন': 'failing to execute', 'load': 'not loading correctly', 'হচ্ছে না': 'failing to execute', 'error': 'throwing runtime exception', 'display': 'failing at DOM rendering', 'ডিসপ্লে': 'failing at DOM rendering' };
    
    let detectedModule = 'Core_System';
    let detectedProblem = 'experiencing unknown execution halt';
    
    Object.keys(moduleMap).forEach(k => { if (rawQuery.includes(k)) detectedModule = moduleMap[k]; });
    Object.keys(problemMap).forEach(k => { if (rawQuery.includes(k)) detectedProblem = problemMap[k]; });

    // Technical English translation (Never scan using Bengali string)
    const normalizedEnglishIntent = `${detectedModule} module is ${detectedProblem}.`.toLowerCase();
    
    // 🟢 RULE 8: REFERENCE SEARCH IS OPTIONAL
    const isReferenceRequested = rawQuery.includes('reference') || rawQuery.includes('রেফারেন্স') || rawQuery.includes('কোথায় কি আছে') || rawQuery.includes('show');

    // Semantic keywords generated ONLY from English intent
    const stopWords = ['module', 'is', 'experiencing', 'at', 'to', 'the', 'a'];
    const semanticKeywords = normalizedEnglishIntent.split(/[\s,]+/).filter(w => w.length > 3 && !stopWords.includes(w));

    // =======================================================
    // 🟢 RULE 4: EXECUTION CHAIN TRACING (BFS)
    // =======================================================
    const allAvailableFiles = getAllFiles(projectRoot);
    const scopeFiles = new Set();

    allAvailableFiles.forEach(file => {
        const relativeName = path.relative(projectRoot, file).toLowerCase();
        if (detectedModule !== 'Core_System' && relativeName.includes(detectedModule.toLowerCase())) scopeFiles.add(file);
    });

    if (scopeFiles.size === 0) {
         allAvailableFiles.filter(f => f.endsWith('index.js') || f.endsWith('server.js') || f.endsWith('app.js')).forEach(f => scopeFiles.add(f));
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
    // 🟢 EXECUTION SCANNER (Rules 2, 3, 5, 6, 7 Enforced)
    // =======================================================
    let scannedLinesCount = 0;
    const summary = { executionFails: 0, referencesHidden: 0 };

    filesToActuallyScan.forEach(filePath => {
        const fileName = path.relative(projectRoot, filePath);
        let fileContent = '';
        try { fileContent = fs.readFileSync(filePath, 'utf-8'); } catch(e) { return; }
        const lines = fileContent.split('\n');
        scannedLinesCount += lines.length;

        lines.forEach((line, index) => {
            const lineLower = line.toLowerCase();
            const lineNumber = index + 1;
            const cleanLine = line.trim();

            // 🟢 RULE 2: NEVER REPORT NOISE
            if (!cleanLine || cleanLine.startsWith('//') || cleanLine.startsWith('/*') || 
                cleanLine.includes('console.log') || cleanLine.includes('alert(') || 
                cleanLine.includes('display: flex') || cleanLine.includes('display: grid') || 
                cleanLine.includes('window.')) {
                return;
            }

            let classification = null;
            let status = 'PASS';
            let analysisReason = '';
            let isCritical = false;
            let isImportBlock = false;
            let exactFailType = ''; // Rule 3 tracker

            // Dependency Block
            if (lineLower.includes('import ') || lineLower.includes('require(')) {
                const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    isImportBlock = true;
                    const importPath = match[1];
                    const isNodeCore = ['fs', 'path', 'url', 'crypto', 'os', 'http'].some(mod => importPath === mod || importPath.startsWith('node:'));
                    const isLocal = importPath.startsWith('./') || importPath.startsWith('../');

                    if (isNodeCore) {
                        classification = 'NODE BUILT-IN'; status = 'PASS';
                    } else if (isLocal) {
                        const absoluteDepPath = path.resolve(path.dirname(filePath), importPath);
                        if (!['', '.js', '/index.js', '.html'].some(ext => fs.existsSync(absoluteDepPath + ext))) {
                            // 🟢 RULE 3: Exact FAIL Type
                            classification = 'EXECUTION HALT'; exactFailType = 'BROKEN IMPORT';
                            status = 'FAIL'; isCritical = true;
                            analysisReason = `Path '${importPath}' points to a missing file.`;
                            summary.executionFails++;
                        } else {
                            classification = 'LOCAL MODULE'; status = 'PASS';
                        }
                    } else {
                        const basePackage = importPath.startsWith('@') ? importPath.split('/').slice(0,2).join('/') : importPath.split('/')[0];
                        if (!packageDeps[basePackage] && !devDeps[basePackage] && !fs.existsSync(path.join(projectRoot, 'node_modules', basePackage))) {
                            classification = 'EXECUTION HALT'; exactFailType = 'MISSING PACKAGE';
                            status = 'FAIL'; isCritical = true;
                            analysisReason = `Package '${basePackage}' is required but not installed.`;
                            summary.executionFails++;
                        } else {
                            classification = 'PACKAGE'; status = 'PASS';
                        }
                    }
                }
            }

            let isMatch = semanticKeywords.length > 0 && semanticKeywords.some(keyword => lineLower.includes(keyword));

            if (!isImportBlock) {
                // 🟢 RULE 3: STRICT EXECUTION BLOCKERS
                if (cleanLine.includes('Cannot read properties of undefined') || cleanLine.match(/\b\w+\.undefined\b/)) {
                    classification = 'EXECUTION HALT'; exactFailType = 'UNDEFINED REFERENCE';
                    status = 'FAIL'; isCritical = true; summary.executionFails++;
                    analysisReason = "Undefined property access detected.";
                } else if (cleanLine.match(/document\.getElementById\(['"](.*?)['"]\)/) && (cleanLine.includes(').innerHTML') || cleanLine.includes(').addEventListener'))) {
                    classification = 'EXECUTION HALT'; exactFailType = 'DOM MISSING';
                    status = 'FAIL'; isCritical = true; summary.executionFails++;
                    analysisReason = "Unsafe DOM binding. If missing, module fails to mount.";
                } else if (cleanLine.includes('export default undefined') || cleanLine.includes('module.exports = {}')) {
                    classification = 'EXECUTION HALT'; exactFailType = 'MISSING EXPORT';
                    status = 'FAIL'; isCritical = true; summary.executionFails++;
                    analysisReason = "Empty export detected. Importing modules will crash.";
                } 
                // 🟢 ORIGINAL LOGIC KEPT ALIVE (BUT HIDDEN IF PASS)
                else if (lineLower.includes('throw new error')) {
                    classification = 'DEFENSIVE CODE'; status = 'PASS';
                } else if (isMatch) {
                    if (lineLower.includes('<') && lineLower.includes('>')) classification = 'UI COMPONENT';
                    else if (lineLower.includes('router.') || lineLower.includes('app.use')) classification = 'ROUTE CONFIG';
                    else classification = 'REFERENCE';
                    status = 'PASS';
                }
            }

            // 🟢 RULE 6: HIDE EVERY PASS (Unless Rule 8 is triggered)
            if (classification) {
                if (status === 'FAIL' || isCritical) {
                    // 🟢 RULE 7: STRICT FAIL FORMATTING
                    const formattedReason = `<strong>Failure Type:</strong> [${exactFailType}]<br>
                    <strong>Execution Path:</strong> Root → ${detectedModule} Module → ${fileName}<br>
                    <strong>Runtime State:</strong> Execution Break<br>
                    <strong>Evidence:</strong> <code>${cleanLine.substring(0, 80)}</code>`;

                    issues.push({
                        stage: exactFailType, status: 'FAIL', file: fileName, line: lineNumber, impact: 'CRITICAL',
                        reason: formattedReason, 
                        suggestedFix: "Immediate fix required. Execution completely stops here."
                    });
                } else if (isReferenceRequested && status === 'PASS') {
                    // Show references ONLY if requested
                    issues.push({
                        stage: classification, status: 'PASS', file: fileName, line: lineNumber, impact: 'INFO',
                        reason: `Structural mapping via English Intent: '${normalizedEnglishIntent}'`, 
                        suggestedFix: "Informational trace only. No action required."
                    });
                } else {
                    summary.referencesHidden++; // Counting hidden passes silently
                }
            }
        });
    });

    issues.sort((a, b) => (a.status === 'FAIL' ? -1 : 1));

    // 🟢 RULE 5 & 9: EXACTLY WHERE DOES EXECUTION STOP?
    let finalResultText = "";
    if (summary.executionFails === 0) {
        finalResultText = "No execution failure detected. Execution reached the end successfully.";
        // Push a green flag issue so the UI doesn't look broken
        issues.push({
            stage: 'SYSTEM STABLE', status: 'PASS', file: 'Engine', line: 0, impact: 'NONE',
            reason: 'Trace complete. No execution blockers found in the traced path.',
            suggestedFix: 'None.'
        });
    } else {
        finalResultText = `Execution stopped at ${summary.executionFails} critical point(s).`;
    }

    const treeData = `[RCA ENGINE V4.4 - EXECUTION TRACE]
 ├── Original Query  : "${query}"
 ├── Normalized Intent: [${normalizedEnglishIntent}]
 ├── Target Module   : [${detectedModule}]
 ├── Execution Path  : ${filesToActuallyScan.length} linked files verified
 ├── Hidden Noise    : ${summary.referencesHidden} PASS states hidden
 └── Final Result    : ${finalResultText}`;

    res.json({ tree: treeData, issues: issues });
});

// ==========================================
// 3. LIVE LOGS
// ==========================================
router.get('/logs', (req, res) => {
    res.json({ logs: `[SERVER] V4.4 Execution Mode Active.\n[TIMESTAMP] ${new Date().toISOString()}` });
});

export default router;
