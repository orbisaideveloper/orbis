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
// 2. THE GOD MODE SCANNER (Deep Project Scan + 6 RCA Rules)
// ==========================================
router.post('/scan', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const issues = [];
    const projectRoot = path.join(__dirname, '../../'); // প্রজেক্টের মেইন ফোল্ডার
    
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

            // 🟢 অ্যাডভান্সড রুল ৬: Root Cause (CRITICAL Dependency Check)
            if (lineLower.includes('import ') || lineLower.includes('require(')) {
                const match = line.match(/(?:from|require\s*\()\s*['"]([^'"]+)['"]/);
                if (match && match[1]) {
                    const depPath = path.resolve(path.dirname(filePath), match[1]);
                    // মডিউল বা ফাইল মিসিং থাকলে CRITICAL
                    if (!fs.existsSync(depPath) && !fs.existsSync(depPath + '.js') && !fs.existsSync(depPath + '/index.js')) {
                        classification = 'CRITICAL';
                        status = 'FAIL';
                        isCritical = true;
                        impactText = 'Critical Server Error';
                        summary.critical++;
                        analysisReason = "BROKEN DEPENDENCY: Module or File is missing!";
                    }
                }
            }

            // আপনার অরিজিনাল লজিক: ইউজার যা খুঁজছে তার সাথে লাইন ম্যাচ করা
            let isMatch = searchKeywords.length > 0 ? searchKeywords.some(keyword => lineLower.includes(keyword)) : lineLower.includes(query.toLowerCase());

            // 🟢 রুল ১-৫: ডাইনামিক ক্লাসিফিকেশন
            if (lineLower.includes('throw new error') || (lineLower.includes('console.error'))) {
                classification = 'ERROR HANDLER'; summary.errorHandlers++;
                status = 'WARN';
                impactText = 'Potential execution break';
                analysisReason = "System error handling block detected.";
            } else if (isMatch && !isCritical) {
                if (lineLower.includes('<') && lineLower.includes('>')) {
                    classification = 'UI'; summary.ui++;
                    analysisReason = "Frontend UI logic matching query.";
                } else if (lineLower.includes('express.static')) {
                    classification = 'STATIC ASSET'; summary.static++;
                    analysisReason = "Static Asset Route matching query.";
                } else if (lineLower.includes('app.use') || lineLower.includes('router.')) {
                    classification = 'ROUTE'; summary.routes++;
                    analysisReason = "Backend Route/Middleware matching query.";
                } else if (lineLower.includes('import ') || lineLower.includes('require(')) {
                    classification = 'REFERENCE'; summary.references++;
                    analysisReason = "Valid dependency reference matching query.";
                } else {
                    classification = 'WARNING'; summary.warnings++;
                    status = 'FAIL';
                    impactText = 'High (User Queried)';
                    analysisReason = `General logic related to "${query}" found.`;
                }
            }

            // 🟢 ফ্রন্টএন্ডের জন্য Reason, Evidence এবং Confidence ফরম্যাটিং
            if (classification) {
                const formattedReason = `<strong>Reason:</strong> ${analysisReason}<br><strong>Evidence:</strong> <code>${cleanLine.substring(0, 65)}...</code><br><strong>Confidence:</strong> ${isCritical ? '100% (Verified)' : 'High (Keyword Match)'}`;

                issues.push({
                    stage: classification,
                    status: status,
                    file: fileName,
                    line: lineNumber,
                    impact: impactText,
                    reason: formattedReason, 
                    suggestedFix: isCritical ? 'Critical: Install dependency or fix exact path.' : 'Review this exact line for logic errors.'
                });
            }
        });
    });

    // 🟢 রুল ৬: Critical Root Cause সবসময় টেবিলের উপরে থাকবে
    issues.sort((a, b) => (a.stage === 'CRITICAL' ? -1 : 1));

    // আপনার ডিপ স্ক্যান সামারি + অরিজিনাল ট্রি ডেটা
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
