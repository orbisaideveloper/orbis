import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

import { createClient } from '@supabase/supabase-js';
import { getTelemetryData, logRequest, addLog } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 
import adminRoutes from './routes/adminRoutes.js';

// 🟢 Lottery Module Route Import
import lotteryRoutes from './modules/digiledger/lottery/routes/lotteryRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🟢 MASTER FIX: Absolute Project Root 
const ROOT_DIR = process.cwd(); 

const app = express();
const PORT = process.env.PORT || 10000; 

const brain = new BrainController(); 

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const logSystemEvent = (level, source, message) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const formattedLog = `[${timestamp}] [${level}] [${source}]: ${message}`;
    
    if (level === 'ERR') console.error(formattedLog);
    else console.log(formattedLog);
    
    try { addLog(level, `[${source}] ${message}`); } catch(e) {}
};

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

// ==============================================================
// 🟢 BULLETPROOF STATIC ROUTING (Safe Bridge for Lottery)
// ==============================================================

// ১. Platform Core Frontend
app.use(express.static(path.join(ROOT_DIR, 'frontend'), { index: false }));

// ২. Safe Public Route - লটারির UI ফাইল নিরাপদে ব্রাউজারে পাঠানোর জন্য
app.use('/assets/lottery', express.static(path.join(ROOT_DIR, 'src/modules/digiledger/lottery/ui')));
app.use('/assets/lottery/ui', express.static(path.join(ROOT_DIR, 'src/modules/digiledger/lottery/ui')));

// ৩. Legacy Cache Fallback - ব্রাউজারে পুরনো লিংক ক্যাশ থাকলে তা সামলানোর জন্য
app.use('/src/modules/digiledger/lottery/ui', express.static(path.join(ROOT_DIR, 'src/modules/digiledger/lottery/ui')));

// ==============================================================

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

app.post('/api/auth/login', (req, res) => {
    const { mobile, password } = req.body;
    logSystemEvent('INFO', 'Auth', `Login attempt for identity: ${mobile}`);

    if (mobile === 'admin' && password === 'admin123') { 
        res.cookie('orbis_admin_session', 'SECURE', { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ success: true, user: { uid: 'ADM_MASTER', mobile, role: 'ADMIN' }, token: 'ORBIS_ADMIN_API_TOKEN' });
    } else if (mobile) {
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
});
