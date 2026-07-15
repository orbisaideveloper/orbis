import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

import { getTelemetryData, logRequest, addLog } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 

// 🟢 NEW: Auth এবং Admin রাউটগুলোর ইম্পোর্ট (ফাইলগুলো তৈরি হলে আমরা এগুলো আনকমেন্ট করব)
// import authRoutes from './auth/authRoutes.js';
// import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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
app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));

const getAppVersion = () => {
    if (process.env.SYSTEM_MODE === 'PRODUCTION') {
        return process.env.FINAL_VERSION || '10.0-STABLE';
    }
    const dynamicHash = Math.floor(1000 + Math.random() * 9000); 
    return `9.01-DEV-${dynamicHash}`;
};

// 🟢 index.html ইন্টারসেপ্টর
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            logSystemEvent('ERR', 'Server', 'Failed to load index.html');
            return res.status(500).send('System Core Error');
        }
        const liveVersion = getAppVersion();
        const finalHtml = data.replace(/{{APP_VERSION}}/g, liveVersion);
        res.send(finalHtml);
    });
});

// ==========================================
// 🟢 NEW: ADMIN WORKSPACE ROUTE (Sprint-1)
// ==========================================
app.get('/admin/login', (req, res) => {
    logSystemEvent('INFO', 'Router', 'Admin login page requested.');
    const adminPath = path.join(__dirname, '../frontend/admin.html');
    
    // ফাইল থাকলে সার্ভ করবে, না থাকলে Coming Soon দেখাবে যাতে সিস্টেম ব্রেক না করে
    if (fs.existsSync(adminPath)) {
        res.sendFile(adminPath);
    } else {
        res.send('<h2 style="font-family:sans-serif; text-align:center; margin-top:20%;">Admin Workspace (Coming Soon)</h2>');
    }
});

// ==========================================
// 🟢 NEW: API ROUTES MOUNTING (Sprint-1)
// ==========================================
// আমরা ফাইলগুলো তৈরি করার পর এই রাউটগুলো চালু করব
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);

// 🟢 লাইভ পোলিং লুপ
app.get('/api/telemetry', (req, res) => {
    try {
        const rawTelemetry = getTelemetryData() || {};
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

// চ্যাট হিস্ট্রি
app.get('/api/history', async (req, res) => {
    try {
        const sessionId = req.query.sessionId || 'default_user';
        const history = await brain.memory.getRecentConversations(sessionId, 50); 
        
        logSystemEvent('INFO', 'Memory', `Restored ${history.length} messages for session: ${sessionId}`);
        res.status(200).json({ success: true, data: history || [] });
    } catch (error) {
        logSystemEvent('ERR', 'Memory', `Failed to fetch history. Reason: ${error.message}`);
        res.status(500).json({ success: false, error: "Failed to load memory", details: error.message });
    }
});

// চ্যাট এপিআই
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

        const brainResponse = await brain.handleRequest({
            type: 'CHAT_MESSAGE',
            content: prompt,
            sessionId: sessionId
        });

        const latency = Date.now() - startTime;

        if (typeof brainResponse === 'string' && (brainResponse.includes('Quota Overload') || brainResponse.includes('দুঃখিত') || brainResponse.includes('ব্যস্ত'))) {
             logSystemEvent('ERR', 'GeminiProvider', 'Connection failed! External API returned a Quota/Overload message.');
        } else {
             logSystemEvent('OK', 'Core', 'Response generated and dispatched successfully.');
        }

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

process.on('unhandledRejection', (reason, promise) => {
    logSystemEvent('ERR', 'GlobalTracker', `Unhandled Promise :: ${reason}`);
});

process.on('uncaughtException', (error) => {
    logSystemEvent('ERR', 'GlobalTracker', `Uncaught Exception: ${error.message}`);
});

app.listen(PORT, () => {
    logSystemEvent('OK', 'Server', `ORBIS Live on Port: ${PORT}`);
});
