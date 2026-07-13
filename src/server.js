import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelemetryData, logRequest } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const brain = new BrainController(); 

// ==========================================
// 🟢 🚨 NEW: Global Error Tracker & Telemetry Logger
// ==========================================
const logSystemEvent = (level, source, message) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
    // এই ফরম্যাটটি ড্যাশবোর্ডের ফিল্টার (INFO, ERR, OK) নিখুঁতভাবে ধরতে পারবে
    const formattedLog = `[${timestamp}] [${level}] [${source}]: ${message}`;
    
    if (level === 'ERR') {
        console.error(formattedLog);
    } else {
        console.log(formattedLog);
    }
};

// 🔥 PERMANENT CACHE KILLER
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
);

app.get('/api/telemetry', (req, res) => {
    res.status(200).json(getTelemetryData());
});

// পেজ রিলোড দিলে চ্যাট হিস্ট্রি ফিরিয়ে দেওয়ার রাস্তা
app.get('/api/history', async (req, res) => {
    try {
        const sessionId = req.query.sessionId || 'default_user';
        const history = await brain.memory.getRecentConversations(sessionId, 50); 
        
        logSystemEvent('INFO', 'Memory', `Restored ${history.length} messages for session: ${sessionId}`);
        res.status(200).json({ success: true, history: history });
    } catch (error) {
        logSystemEvent('ERR', 'Memory', `Failed to fetch history. Reason: ${error.message}`);
        res.status(500).json({ success: false, error: "Failed to load memory", details: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        logRequest();
        const prompt = req.body.prompt;

        if (!prompt) {
            logSystemEvent('WARN', 'Router', 'Empty prompt received from frontend.');
            return res.status(400).json({ success: false, message: "Prompt missing" });
        }

        logSystemEvent('INFO', 'Router', 'Directing payload to ORBIS Core Brain...');

        // ডাইরেক্ট জেমিনির বদলে এখন Brain কাজ করবে
        const brainResponse = await brain.handleRequest({
            type: 'CHAT_MESSAGE',
            content: prompt
        });

        // 🟢 🚨 যদি প্রোভাইডার থেকে কোনো হার্ডকোড করা ফেইল মেসেজ আসে, সিস্টেম সেটাকে ধরে লগ করবে
        if (typeof brainResponse === 'string' && (brainResponse.includes('Quota Overload') || brainResponse.includes('দুঃখিত'))) {
             logSystemEvent('ERR', 'GeminiProvider', 'Connection failed! External API returned a Quota/Overload message.');
        } else {
             logSystemEvent('OK', 'Core', 'Response generated and dispatched successfully.');
        }

        res.status(200).json({ success: true, response: brainResponse });

    } catch (error) {
        // 🟢 🚨 সেন্ট্রাল এরর ক্যাচার: ঠিক কোন ফাইলে কী এরর হয়েছে তা ড্যাশবোর্ডে পাঠানো হচ্ছে
        logSystemEvent('ERR', 'ExecutionChain', `Critical Failure - ${error.message}`);
        
        res.status(500).json({
            success: false,
            error: "System Architecture Error",
            details: error.message, // আসল কারণ ফ্রন্টএন্ডে পাঠানো হচ্ছে
            source: "server.js"
        });
    }
});

// 🟢 🚨 আনক্যাচড এরর হ্যান্ডলার (যাতে কোনো এররের কারণে সার্ভার ক্র্যাশ না করে)
process.on('unhandledRejection', (reason, promise) => {
    logSystemEvent('ERR', 'GlobalTracker', `Unhandled Promise Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
    logSystemEvent('ERR', 'GlobalTracker', `Uncaught Exception: ${error.message}`);
});

app.listen(PORT, () => {
    logSystemEvent('OK', 'Server', `ORBIS Live on Port: ${PORT}`);
});
