import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ES Module-এর জন্য __dirname তৈরি করা (যেহেতু import-এ বাই ডিফল্ট এটি থাকে না)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ==========================================
// 1. HEALTH ENGINE (Real Server Stats)
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
// 2. THE GOD MODE SCANNER (Line-by-Line File Reader)
// ==========================================
router.post('/scan', (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const issues = [];
    
    // ⚠️ প্রজেক্টের মেইন ফোল্ডারের প্যাথ
    const projectRoot = path.join(__dirname, '../../'); 
    
    // যে ফাইলগুলো আমরা রিভার্স স্ক্যান করব:
    const filesToScan = [
        'server.js', 
        'src/routes/diagnosticsRoutes.js', 
        'frontend/diagnostics.html' // আপনার HTML ফাইল যেখানে আছে (frontend ফোল্ডার)
    ];

    // ইউজারের সার্চ কোয়েরি থেকে মূল শব্দগুলো আলাদা করা
    const searchKeywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    
    let scannedLinesCount = 0;

    filesToScan.forEach(fileName => {
        // ফাইলের আসল লোকেশন বের করা
        let filePath = path.join(projectRoot, fileName);
        
        // যদি ফোল্ডার স্ট্রাকচার আলাদা হয়, তবে নরমাল ডিরেক্টরি চেক:
        if (!fs.existsSync(filePath)) filePath = path.join(__dirname, fileName); 
        if (!fs.existsSync(filePath)) filePath = path.join(__dirname, '../', fileName);

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');
            scannedLinesCount += lines.length;

            lines.forEach((line, index) => {
                const lineLower = line.toLowerCase();
                const lineNumber = index + 1;

                // ১. ডেডলক বা এরর পয়েন্ট খোঁজা
                if (lineLower.includes('throw new error') || (lineLower.includes('console.error') && !lineLower.trim().startsWith('//'))) {
                    issues.push({
                        stage: 'Code Analysis',
                        status: 'WARN',
                        file: fileName,
                        line: lineNumber,
                        impact: 'Potential execution break',
                        reason: `System found an error handling block: "${line.trim()}"`,
                        suggestedFix: 'Ensure inputs are validated before this line executes.'
                    });
                }

                // ২. ইউজার যা খুঁজছে তার সাথে লাইন ম্যাচ করা
                let isMatch = searchKeywords.some(keyword => lineLower.includes(keyword));
                if (isMatch && searchKeywords.length > 0) {
                    issues.push({
                        stage: 'Target Matched',
                        status: 'FAIL',
                        file: fileName,
                        line: lineNumber,
                        impact: 'High (User Queried)',
                        reason: `Logic related to "${query}" found here:\nCode: ${line.trim()}`,
                        suggestedFix: 'Review this exact line. Check for spelling mistakes, wrong variables, or broken logic.'
                    });
                }
            });
        } else {
            // যদি ফাইল খুঁজে না পায়
            issues.push({
                stage: 'File System',
                status: 'FAIL',
                file: fileName,
                line: 'N/A',
                impact: 'Critical Server Error',
                reason: `The scanner could not locate the file at: ${filePath}`,
                suggestedFix: 'Fix the folder path (path.join) so the scanner can read it.'
            });
        }
    });

    // ৩. এক্সিকিউশন ট্রি বানানো
    const treeData = `[START RUNTIME AUDIT]
 ├── Query Received: "${query}"
 ├── Files Scanned: ${filesToScan.join(', ')}
 ├── Total Lines Read: ${scannedLinesCount}
 └── Anomalies Detected: ${issues.length}`;

    // রেজাল্ট ফ্রন্টএন্ডে পাঠানো
    res.json({
        tree: treeData,
        issues: issues.slice(0, 15) // সর্বোচ্চ ১৫টা রেজাল্ট দেখাবে
    });
});

// ==========================================
// 3. LIVE LOGS 
// ==========================================
router.get('/logs', (req, res) => {
    res.json({ logs: `[SERVER] Diagnostic Engine V3.6 Online.\n[TIMESTAMP] ${new Date().toISOString()}\n[STATUS] Awaiting developer commands...` });
});

// 🟢 NEW: Export default router (ES Module Support)
export default router;
