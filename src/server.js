import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// 🟢 আপডেট: addLog যুক্ত করা হয়েছে যাতে ড্যাশবোর্ডের লগবুক ডেটা পায়
import { getTelemetryData, logRequest, addLog } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render-এর সাথে সামঞ্জস্য রেখে পোর্ট ১০০০০ ডিফল্ট করা হলো, লোকাল হোস্ট হলে ৩০০০ নেবে
const PORT = process.env.PORT || 10000; 

const brain = new BrainController(); 

// ==========================================
// 🟢 Global Error Tracker & Telemetry Logger
// ==========================================
const logSystemEvent = (level, source, message) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const formattedLog = `[${timestamp}] [${level}] [${source}]: ${message}`;
    
    if (level === 'ERR') {
        console.error(formattedLog);
    } else {
        console.log(formattedLog);
    }
    
    // 🟢 আপডেট: এই লাইনটির জন্যই এখন আপনার ড্যাশবোর্ডের কালো লগবক্স কাজ করবে
    try {
        addLog(level, `[${source}] ${message}`);
    } catch(e) {}
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

// 🟢 ফিক্স: ড্যাশবোর্ডের লাইভ পোলিং লুপের জন্য এন্ডপয়েন্টটি সম্পূর্ণ সচল করা হলো
app.get('/api/telemetry', (req, res) => {
    try {
        const rawTelemetry = getTelemetryData() || {};
        // ব্রেইনে কতগুলো একটিভ মেসেজ নোড আছে তাও সাথে যোগ করে দেওয়া হলো
        const activeNodes = brain.memory?.nodes?.length || 36;
        
        res.status(200).json({
            success: true,
            telemetry: {
                ...rawTelemetry,
                memoryNodes: activeNodes,
                timestamp: new Date().toISOString()
            }
        });
    } catch (e) {
        res.status(200).json({ success: false, telemetry: {} });
    }
});

// পেজ রিলোড দিলে চ্যাট হিস্ট্রি ফিরিয়ে দেওয়ার রাস্তা
app.get('/api/history', async (req, res) => {
    try {
        const sessionId = req.query.sessionId || 'default_user';
        const history = await brain.memory.getRecentConversations(sessionId, 50); 
        
        logSystemEvent('INFO', 'Memory', `Restored ${history.length} messages for session: ${sessionId}`);
        res.status(200).json({ success: true, history: history || [] });
    } catch (error) {
        logSystemEvent('ERR', 'Memory', `Failed to fetch history. Reason: ${error.message}`);
        res.status(500).json({ success: false, error: "Failed to load memory", details: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    try {
        logRequest();
        const prompt = req.body.prompt;
        const sessionId = req.body.sessionId || 'default_user';

        if (!prompt) {
            logSystemEvent('WARN', 'Router', 'Empty prompt received from frontend.');
            return res.status(400).json({ success: false, message: "Prompt missing" });
        }

        logSystemEvent('INFO', 'Router', 'Directing payload to ORBIS Core Brain...');

        // ডাইরেক্ট জেমিনির বদলে এখন Brain কাজ করবে
        const brainResponse = await brain.handleRequest({
            type: 'CHAT_MESSAGE',
            content: prompt,
            sessionId: sessionId
        });

        // রেসপন্স জেনারেট হতে কত সময় লাগলো (Latency)
        const latency = Date.now() - startTime;

        // 🟢 যদি প্রোভাইডার থেকে কোনো হার্ডকোড করা ফেইল মেসেজ আসে, সিস্টেম সেটাকে ধরে লগ করবে
        if (typeof brainResponse === 'string' && (brainResponse.includes('Quota Overload') || brainResponse.includes('দুঃখিত') || brainResponse.includes('ব্যস্ত'))) {
             logSystemEvent('ERR', 'GeminiProvider', 'Connection failed! External API returned a Quota/Overload message.');
        } else {
             logSystemEvent('OK', 'Core', 'Response generated and dispatched successfully.');
        }

        // 🟢 ফিক্স: সফল চ্যাটের সাথে সাথে লাইভ ল্যাটেন্সি এবং আপডেট টেলিমেট্রি ফ্রন্টএন্ডে ইনজেক্ট করা হলো
        const rawTelemetry = getTelemetryData() || {};
        res.status(200).json({ 
            success: true, 
            response: brainResponse,
            telemetry: {
                ...rawTelemetry,
                latency: latency,
                memoryNodes: brain.memory?.nodes?.length || 36,
                lastRoute: typeof brainResponse === 'string' && brainResponse.includes('[Local Brain Active]') ? 'Core → Local Mind' : 'Core → Provider'
            }
        });

    } catch (error) {
        logSystemEvent('ERR', 'ExecutionChain', `Critical Failure - ${error.message}`);
        
        res.status(500).json({
            success: false,
            error: "System Architecture Error",
            details: error.message,
            source: "server.js"
        });
    }
});

// 🟢 আনক্যাচড এরর হ্যান্ডলার (যাতে কোনো এররের কারণে সার্ভার ক্র্যাশ না করে)
process.on('unhandledRejection', (reason, promise) => {
    logSystemEvent('ERR', 'GlobalTracker', `Unhandled Promise Rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
    logSystemEvent('ERR', 'GlobalTracker', `Uncaught Exception: ${error.message}`);
});

app.listen(PORT, () => {
    logSystemEvent('OK', 'Server', `ORBIS Live on Port: ${PORT}`);
});
