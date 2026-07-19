import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

import { createClient } from '@supabase/supabase-js';
import { getTelemetryData, logRequest, addLog } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 
import adminRoutes from './routes/adminRoutes.js';
import lotteryRoutes from './modules/digiledger/lottery/routes/lotteryRoutes.js';

// 🟢 NEW TRACKING & SECURITY PACKAGES IMPORT
import statusMonitor from 'express-status-monitor';
import morgan from 'morgan';
import winston from 'winston';
import Joi from 'joi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = process.cwd(); 

const app = express();
const PORT = process.env.PORT || 10000; 
const brain = new BrainController(); 

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// ==============================================================
// 🟢 WINSTON LOGGER SETUP (Error & System Logs Saver)
// ==============================================================
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(info => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        // এররগুলো ফাইলে সেভ হবে (Render-এ ফাইলগুলো টেম্পোরারি থাকতে পারে, তবে লগগুলো পারফেক্ট দেখাবে)
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/system.log' })
    ]
});

// Update old log function to use Winston
const logSystemEvent = (level, source, message) => {
    const logMsg = `[${source}]: ${message}`;
    if (level === 'ERR') logger.error(logMsg);
    else if (level === 'WARN') logger.warn(logMsg);
    else logger.info(logMsg);
    
    try { addLog(level, logMsg); } catch(e) {}
};

// ==============================================================
// 🟢 NEW MIDDLEWARES (The Cockpit & The Tracker)
// ==============================================================
// ১. The Cockpit: এটা আপনার /status লিংকে ড্যাশবোর্ড তৈরি করবে
app.use(statusMonitor({
    title: 'ORBIS Core Status',
    path: '/status',
    spans: [{ interval: 1, retention: 60 }],
    chartVisibility: { cpu: true, mem: true, load: true, responseTime: true, rps: true, statusCodes: true }
}));

// ২. Morgan: কে কোন API কল করছে, তা রেন্ডারের লগে লাইভ প্রিন্ট করবে
app.use(morgan('dev'));

// ==============================================================

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.json());

app.use('/admin.html', (req, res, next) => {
    logSystemEvent('INFO', 'Security', `Admin page access attempt from ${req.ip}`);
    const cookieHeader = req.headers.cookie || '';
    const hasAdminSession = cookieHeader.includes('orbis_admin_session=SECURE');
    
    if (hasAdminSession) {
        next(); 
    } else {
        logSystemEvent('WARN', 'Security', `Unauthorized access blocked for Admin Dashboard.`);
        res.redirect('/admin/login'); 
    }
});

// 🟢 BULLETPROOF STATIC ROUTING
app.use(express.static(path.join(ROOT_DIR, 'frontend'), { index: false }));
app.use('/assets/lottery', express.static(path.join(ROOT_DIR, 'src/modules/digiledger/lottery/ui')));
app.use('/assets/lottery/ui', express.static(path.join(ROOT_DIR, 'src/modules/digiledger/lottery/ui')));
app.use('/src/modules/digiledger/lottery/ui', express.static(path.join(ROOT_DIR, 'src/modules/digiledger/lottery/ui')));

const getAppVersion = () => {
    if (process.env.SYSTEM_MODE === 'PRODUCTION') return process.env.FINAL_VERSION || '10.0-STABLE';
    return `9.01-DEV-${Math.floor(1000 + Math.random() * 9000)}`;
};

app.get('/', (req, res) => {
    const indexPath = path.join(ROOT_DIR, 'frontend/index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            logSystemEvent('ERR', 'Server', 'Failed to load index.html');
            return res.status(500).send('System Core Error');
        }
        res.send(data.replace(/{{APP_VERSION}}/g, getAppVersion()));
    });
});

// ==============================================================
// 🟢 JOI FILTER APPLIED TO LOGIN (ডেটা ছাঁকনি)
// ==============================================================
const loginSchema = Joi.object({
    mobile: Joi.string().min(4).required(),
    password: Joi.string().optional().allow('')
});

app.post('/api/auth/login', (req, res) => {
    // Joi দিয়ে আগে ডেটা চেক করা হচ্ছে
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
        logSystemEvent('WARN', 'Auth', `Invalid Login Data Attempted: ${error.details[0].message}`);
        return res.status(400).json({ success: false, message: "সঠিক ফরম্যাটে ডেটা দিন!" });
    }

    const { mobile, password } = value;
    logSystemEvent('INFO', 'Auth', `Login attempt for identity: ${mobile}`);

    // Admin-User Separate Logic
    if (mobile === 'admin' && password === 'admin123') { 
        res.cookie('orbis_admin_session', 'SECURE', { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ success: true, user: { uid: 'ADM_MASTER', mobile, role: 'ADMIN' }, token: 'ORBIS_ADMIN_API_TOKEN' });
    } else if (mobile && mobile !== 'admin') {
        res.status(200).json({ success: true, user: { uid: `USR_${Date.now()}`, mobile, role: 'USER' }, token: 'ORBIS_USER_API_TOKEN' });
    } else {
        res.status(401).json({ success: false, message: "Invalid identity credentials" });
    }
});

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('orbis_admin_session');
    res.status(200).json({ success: true, message: "Session cleared successfully" });
});

app.get('/admin/login', (req, res) => {
    const adminPath = path.join(ROOT_DIR, 'frontend/admin.html');
    if (fs.existsSync(adminPath)) res.sendFile(adminPath);
    else res.send('<h2 style="text-align:center; margin-top:20%;">Admin Workspace (Coming Soon)</h2>');
});

// Main Platform Routes
app.use('/api/admin', adminRoutes);
app.use('/api/lottery', lotteryRoutes);

app.get('/api/telemetry', (req, res) => {
    try {
        res.status(200).json({ success: true, telemetry: { ...getTelemetryData(), memoryNodes: brain.memory?.nodes?.length || 36, timestamp: new Date().toISOString() } });
    } catch (e) {
        res.status(200).json({ success: false, telemetry: {} });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const sessionId = req.query.sessionId || 'default_user';
        
        if (supabase) {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('orb_id', sessionId)
                .order('created_at', { ascending: true })
                .limit(50);
                
            if (!error && data) {
                logSystemEvent('INFO', 'Cloud', `Restored ${data.length} messages from Supabase for ORB-ID: ${sessionId}`);
                return res.status(200).json({ success: true, data: data });
            }
        }

        const fallbackHistory = await brain.memory.getRecentConversations(sessionId, 50); 
        logSystemEvent('INFO', 'LocalMemory', `Restored history locally for: ${sessionId}`);
        res.status(200).json({ success: true, data: fallbackHistory || [] });

    } catch (error) {
        logSystemEvent('ERR', 'Memory', `History Fetch Failed: ${error.message}`);
        res.status(500).json({ success: false, error: "Failed to load memory" });
    }
});

app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    try {
        logRequest();
        const prompt = req.body.prompt;
        const sessionId = req.body.sessionId || 'default_user';

        if (!prompt) return res.status(400).json({ success: false, message: "Prompt missing" });

        logSystemEvent('INFO', 'Router', `Processing prompt for ORB-ID: ${sessionId}`);

        const brainResponse = await brain.handleRequest({ type: 'CHAT_MESSAGE', content: prompt, sessionId: sessionId });

        if (supabase) {
            try {
                await supabase.from('users').upsert({ orb_id: sessionId }, { onConflict: 'orb_id' });
                await supabase.from('chat_history').insert([
                    { orb_id: sessionId, sender: 'YOU', message: prompt },
                    { orb_id: sessionId, sender: 'ORBIS', message: brainResponse }
                ]);
                logSystemEvent('OK', 'Cloud', 'Chat and User ID synced to Supabase securely.');
            } catch (dbError) {
                logSystemEvent('ERR', 'Cloud', `Supabase sync failed: ${dbError.message}`);
            }
        }

        const latency = Date.now() - startTime;
        res.status(200).json({ 
            success: true, 
            response: brainResponse,
            telemetry: {
                ...getTelemetryData(),
                latency: latency,
                memoryNodes: brain.memory?.nodes?.length || 36,
                lastRoute: 'Core → Active'
            }
        });

    } catch (error) {
        logSystemEvent('ERR', 'ExecutionChain', `Critical Failure - ${error.message}`);
        res.status(500).json({ success: false, error: "System Architecture Error", details: error.message });
    }
});

app.post('/api/history/clear', async (req, res) => {
    const sessionId = req.body.sessionId;
    if (!sessionId) return res.status(400).json({ success: false, message: "Session ID missing" });

    try {
        if (supabase) {
            await supabase.from('chat_history').delete().eq('orb_id', sessionId);
            logSystemEvent('WARN', 'Cloud', `All history deleted for ORB-ID: ${sessionId}`);
        } else if (brain.memory) {
            brain.memory.clearSession(sessionId);
        }
        res.status(200).json({ success: true, message: "Memory cleared" });
    } catch (error) {
        logSystemEvent('ERR', 'Memory', `Delete failed: ${error.message}`);
        res.status(500).json({ success: false, error: "Deletion failed" });
    }
});

process.on('unhandledRejection', (reason) => logSystemEvent('ERR', 'GlobalTracker', `Unhandled Promise :: ${reason}`));
process.on('uncaughtException', (error) => logSystemEvent('ERR', 'GlobalTracker', `Uncaught Exception: ${error.message}`));

app.listen(PORT, () => {
    logSystemEvent('OK', 'Server', `ORBIS Live on Port: ${PORT}`);
    console.log(`🚀 COCKPIT READY AT: http://localhost:${PORT}/status`);
});
