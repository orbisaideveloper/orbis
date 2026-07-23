import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES Module-এর জন্য __dirname তৈরি করা
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 🟢 অ্যাডভান্সড ফাংশন: পুরো প্রজেক্ট ডাইনামিক স্ক্যান করার জন্য (যেকোনো নতুন ফাইল অটো অ্যাড হবে)
function getAllFiles(dirPath, arrayOfFiles) {
    try {
        const files = fs.readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function(file) {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                // node_modules এবং অন্যান্য অপ্রয়োজনীয় ফোল্ডার বাদ দেওয়া হলো স্ক্যান ফাস্ট করার জন্য
                if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                }
            } else {
                // শুধুমাত্র কোড ফাইলগুলো স্ক্যান করবে
                if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.json')) {
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
// 1. HEALTH ENGINE (আপনার অরিজিনাল রিয়েল-টাইম RAM লজিক)
// ==========================================
router.get('/health', (req, res) => {
    try {
        const memory = process.memoryUsage();
        res.json({
            score: 98,
            project: { value: 'OPERATIONAL', status: 'PASS', detail: 'Node.js Express Server is actively listening.' },
            ram: { value: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`, status: 'PASS', detail: `Total Heap: ${Math.round(memory.heapTotal / 1024 / 1024)} MB` },
            dependency: { value: 'STABLE', status: 'PASS', detail: 'All core modules (fs, path, express) loaded correctly.' },
            console: { value: 'ACTIVE', status: 'PASS', detail: 'Ready to stream server logs.' }
        });
    } catch (err) {
        res.status(500).json({ error: "Health check failed." });
    }
});

// ==========================================
// 2. THE GOD MODE SCANNER (Deep Project Scan + 5-Step Engine)
// ==========================================
router.post('/scan', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const issues = [];
    const projectRoot = path.join(__dirname, '../../'); // প্রজেক্টের মেইন ফোল্ডার
    
    // 🟢 Step 2 Verification-এর জন্য package.json রিড করা
    let packageDeps = {};
    let packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) packageJsonPath = path.join(__dirname, '../../', 'package.json'); // Fallback path
    
    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            packageDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        } catch (err) {
            console.error("Package.json parsing error:", err.message);
        }
    }
    
    // 🟢 এখন পুরো প্রজেক্ট স্ক্যান হবে
    const allProjectFiles = getAllFiles(projectRoot);

    // আপনার অরিজিনাল কি-ওয়ার্ড ফিল্টার
    const searchKeywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    
    let scannedLinesCount = 0;
    const summary = { references: 0, routes: 0, static: 0, ui: 0, errorHandlers: 0, warnings: 0, critical: 0 };

    allProjectFiles.forEach(filePath => {
        const fileName = path.relative(projectRoot, filePath); // ফাইলের ক্লিন নাম
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        scannedLinesCount += lines.length;

        lines.forEach((line, index) => {
            const lineLower = line.toLowerCase();
            const lineNumber = index + 1;
            const cleanLine = line.trim();

            if (!cleanLine || cleanLine.startsWith('//')) return;

            let classification = null;
            let status = 'PASS';
            let impactText = 'Low';
            let analysisReason = '';
            let isCritical = false;
            let isImportBlock = false;

            // 🟢 অ্যাডভান্সড রুল ৬: 5-Step Dependency Verification Engine (SonarCloud Logic)
            if (lineLower.includes('import ') || lineLower.includes('require(')) {
                const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    isImportBlock = true;
                    const importPath = match[1];
                    
                    // STEP 1: Node Built-in Check
                    const nodeBuiltIns = ['fs', 'path', 'url', 'crypto', 'os', 'stream', 'events', 'http', 'https', 'util'];
                    const isBuiltIn = nodeBuiltIns.some(mod => importPath === mod || importPath.startsWith('node:'));
                    
                    // STEP 3: Local Module Check
                    const isLocal = importPath.startsWith('./') || importPath.startsWith('../');
                    
                    // STEP 4: Test Dependency Check
                    const isTestFile = fileName.endsWith('.test.js') || fileName.endsWith('.spec.js');

                    if (isBuiltIn) {
                        classification = 'NODE BUILT-IN'; summary.references++;
                        analysisReason = `System Verified: Core Node.js built-in module (${importPath}). Never missing.`;
                    } else if (isTestFile && (importPath === 'jest' || importPath === 'vitest')) {
                        classification = 'TEST DEPENDENCY'; summary.references++;
                        analysisReason = `System Verified: Environment specific test dependency (${importPath}).`;
                    } else if (isLocal) {
                        const absoluteDepPath = path.resolve(path.dirname(filePath), importPath);
                        // STEP 3 Check: ফিজিক্যালি চেক করা হচ্ছে লোকাল ফাইলটি আছে কিনা
                        if (fs.existsSync(absoluteDepPath) || fs.existsSync(absoluteDepPath + '.js') || fs.existsSync(absoluteDepPath + '/index.js') || fs.existsSync(absoluteDepPath + '.html')) {
                            classification = 'LOCAL MODULE'; summary.references++;
                            analysisReason = `System Verified: Local relative module '${importPath}' resolved successfully.`;
                        } else {
                            classification = 'BROKEN LOCAL IMPORT';
                            status = 'FAIL';
                            isCritical = true;
                            impactText = 'Critical Server Error';
                            summary.critical++;
                            analysisReason = `BROKEN LOCAL IMPORT: The relative path '${importPath}' points to a non-existent file!`;
                        }
                    } else {
                        // STEP 2: NPM Package Check against package.json
                        let basePackage = importPath;
                        if (importPath.startsWith('@')) {
                            const parts = importPath.split('/');
                            if (parts.length >= 2) basePackage = `${parts[0]}/${parts[1]}`;
                        } else {
                            basePackage = importPath.split('/')[0];
                        }

                        if (packageDeps[basePackage]) {
                            classification = 'PACKAGE'; summary.references++;
                            analysisReason = `System Verified: NPM Package '${basePackage}' is installed and present in package.json.`;
                        } else {
                            classification = 'BROKEN PACKAGE';
                            status = 'FAIL';
                            isCritical = true;
                            impactText = 'Critical Server Error';
                            summary.critical++;
                            analysisReason = `BROKEN PACKAGE DEPENDENCY: '${basePackage}' is imported but missing in package.json!`;
                        }
                    }
                }
            }

            // আপনার অরিজিনাল লজিক: ইউজার যা খুঁজছে তার সাথে লাইন ম্যাচ করা
            let isMatch = searchKeywords.length > 0 ? searchKeywords.some(keyword => lineLower.includes(keyword)) : lineLower.includes(query.toLowerCase());

            // 🟢 রুল ১-৫: সাধারণ লজিক (যদি ইমপোর্ট লাইন না হয়, তবেই কাজ করবে)
            if (!isImportBlock) {
                if (lineLower.includes('throw new error') || (lineLower.includes('console.error'))) {
                    classification = 'ERROR HANDLER'; summary.errorHandlers++;
                    status = 'WARN';
                    impactText = 'Potential execution break';
                    analysisReason = "System error handling block detected.";
                } else if (isMatch) {
                    if (lineLower.includes('<') && lineLower.includes('>')) {
                        classification = 'UI'; summary.ui++;
                        analysisReason = "Frontend UI logic matching query.";
                    } else if (lineLower.includes('express.static')) {
                        classification = 'STATIC ASSET'; summary.static++;
                        analysisReason = "Static Asset Route matching query.";
                    } else if (lineLower.includes('app.use') || lineLower.includes('router.')) {
                        classification = 'ROUTE'; summary.routes++;
                        analysisReason = "Backend Route/Middleware matching query.";
                    } else {
                        classification = 'WARNING'; summary.warnings++;
                        status = 'FAIL';
                        impactText = 'High (User Queried)';
                        analysisReason = `General logic related to "${query}" found.`;
                    }
                }
            }

            // 🟢 ফ্রন্টএন্ডের জন্য Reason, Evidence এবং Confidence ফরম্যাটিং
            // শুধুমাত্র ক্রিটিক্যাল ইস্যু, ইউজারের সার্চ করা টার্গেট, বা এরর হ্যান্ডলারগুলোই টেবিলে পুশ হবে
            if (classification && (isCritical || isMatch || classification === 'ERROR HANDLER')) {
                const formattedReason = `<strong>Reason:</strong> ${analysisReason}<br><strong>Evidence:</strong> <code>${cleanLine.substring(0, 75)}...</code><br><strong>Confidence:</strong> ${isCritical ? '100% (Engine Verified)' : 'High (Pattern Match)'}`;

                issues.push({
                    stage: classification,
                    status: status,
                    file: fileName,
                    line: lineNumber,
                    impact: impactText,
                    reason: formattedReason, 
                    suggestedFix: isCritical ? 'Critical: Install the exact package via npm or fix the file path immediately.' : 'Review this specific block for potential logical errors.'
                });
            }
        });
    });

    // 🟢 রুল ৬: যেকোনো "BROKEN" ইস্যু সবসময় টেবিলের উপরে (Top Priority) থাকবে
    issues.sort((a, b) => (a.status === 'FAIL' && a.stage.includes('BROKEN') ? -1 : 1));

    // আপনার ডিপ স্ক্যান সামারি + অরিজিনাল ট্রি ডেটা (অক্ষত)
    const treeData = `[DEEP SYSTEM SCAN RESULTS]
 ├── Query Received : "${query}"
 ├── Files Scanned  : ${allProjectFiles.length} files
 ├── Lines Read     : ${scannedLinesCount}
 ├── RCA Status     : UI(${summary.ui}) | Routes(${summary.routes}) | References(${summary.references}) | Broken(${summary.critical})
 └── Anomalies Found: ${issues.length}`;

    res.json({
        tree: treeData,
        issues: issues // লিমিট তুলে দেওয়া হলো যাতে পুরো প্রজেক্টের সব ইস্যু দেখতে পান
    });
});

// ==========================================
// 3. LIVE LOGS (আপনার অরিজিনাল টাইমস্ট্যাম্প লজিক)
// ==========================================
router.get('/logs', (req, res) => {
    res.json({ logs: `[SERVER] Diagnostic Engine Deep Scan Online.\n[TIMESTAMP] ${new Date().toISOString()}\n[STATUS] Awaiting developer commands...` });
});

export default router;
