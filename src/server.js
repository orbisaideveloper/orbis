import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; 

// 🟢 NEW: Supabase Client Import
import { createClient } from '@supabase/supabase-js';

import { getTelemetryData, logRequest, addLog } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 

import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000; 

const brain = new BrainController(); 

// ==========================================
// 🟢 CLOUD DATABASE SETUP (Supabase)
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
// চাবি থাকলে কানেক্ট হবে, না থাকলে লোকাল মেমরি ব্যবহার করবে
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;


// ==========================================
// 🟢 Global Error Tracker & Telemetry Logger
// ==========================================
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

// ==========================================
// 🟢 ADMIN ROUTE PROTECTION
// ==========================================
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

app.use(express.static(path.join(__dirname, '../frontend'), { index: false }));

const getAppVersion = () => {
    if (process.env.SYSTEM_MODE === 'PRODUCTION') return process.env.FINAL_VERSION || '10.0-STABLE';
    return `9.01-DEV-${Math.floor(1000 + Math.random() * 9000)}`;
};

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '../frontend/index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
            logSystemEvent('ERR', 'Server', 'Failed to load index.html');
            return res.status(500).send('System Core Error');
        }
        res.send(data.replace(/{{APP_VERSION}}/g, getAppVersion()));
    });
});

// ==========================================
// 🟢 AUTH & IDENTITY SYSTEM
// ==========================================
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
    const adminPath = path.join(__dirname, '../frontend/admin.html');
    if (fs.existsSync(adminPath)) res.sendFile(adminPath);
    else res.send('<h2 style="text-align:center; margin-top:20%;">Admin Workspace (Coming Soon)</h2>');
});

app.use('/api/admin', adminRoutes);

app.get('/api/telemetry', (req, res) => {
    try {
        res.status(200).json({ success: true, telemetry: { ...getTelemetryData(), memoryNodes: brain.memory?.nodes?.length || 36, timestamp: new Date().toISOString() } });
    } catch (e) {
        res.status(200).json({ success: false, telemetry: {} });
    }
});

// ==========================================
// 🟢 SUPABASE CLOUD MEMORY SYSTEM
// ==========================================

// 1. চ্যাট হিস্ট্রি রিস্টোর করা (Load History)
app.get('/api/history', async (req, res) => {
    try {
        const sessionId = req.query.sessionId || 'default_user';
        
        // যদি Supabase কানেক্টেড থাকে, ক্লাউড থেকে ডেটা আনবে
        if (supabase) {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('orb_id', sessionId)
                .order('created_at', { ascending: true })
                .limit(50);
                
            if (!error && data && data.length > 0) {
                logSystemEvent('INFO', 'Cloud', `Restored ${data.length} messages from Supabase for ORB-ID: ${sessionId}`);
                return res.status(200).json({ success: true, data: data });
            }
        }

        // ক্লাউডে না পেলে বা কানেকশন না থাকলে লোকাল মেমরি থেকে আনবে
        const fallbackHistory = await brain.memory.getRecentConversations(sessionId, 50); 
        logSystemEvent('INFO', 'LocalMemory', `Restored history locally for: ${sessionId}`);
        res.status(200).json({ success: true, data: fallbackHistory || [] });

    } catch (error) {
        logSystemEvent('ERR', 'Memory', `History Fetch Failed: ${error.message}`);
        res.status(500).json({ success: false, error: "Failed to load memory" });
    }
});

// 2. চ্যাট করা এবং ক্লাউডে সেভ করা (Chat & Save)
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    try {
        logRequest();
        const prompt = req.body.prompt;
        const sessionId = req.body.sessionId || 'default_user';

        if (!prompt) return res.status(400).json({ success: false, message: "Prompt missing" });

        logSystemEvent('INFO', 'Router', `Processing prompt for ORB-ID: ${sessionId}`);

        // ব্রেন থেকে উত্তর জেনারেট করা
        const brainResponse = await brain.handleRequest({ type: 'CHAT_MESSAGE', content: prompt, sessionId: sessionId });

        // 🟢 SUPABASE-এ চ্যাট সেভ করা
        if (supabase) {
            try {
                // ইউজার না থাকলে তৈরি করবে
                await supabase.from('users').upsert({ orb_id: sessionId }, { onConflict: 'orb_id' });
                
                // চ্যাট ইনসার্ট করবে
                await supabase.from('chat_history').insert([
                    { orb_id: sessionId, sender: 'YOU', message: prompt },
                    { orb_id: sessionId, sender: 'ORBIS', message: brainResponse }
                ]);
                logSystemEvent('OK', 'Cloud', 'Chat synced to Supabase securely.');
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

process.on('unhandledRejection', (reason) => logSystemEvent('ERR', 'GlobalTracker', `Unhandled Promise :: ${reason}`));
process.on('uncaughtException', (error) => logSystemEvent('ERR', 'GlobalTracker', `Uncaught Exception: ${error.message}`));

app.listen(PORT, () => {
    logSystemEvent('OK', 'Server', `ORBIS Live on Port: ${PORT}`);
});
