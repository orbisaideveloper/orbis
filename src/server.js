import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelemetryData, logRequest } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Brain Controller ইনিশিয়ালাইজ করা হলো
const brain = new BrainController(); 

// 🔥 PERMANENT CACHE KILLER
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.json());

// ঠিক আগের মতোই frontend ফোল্ডার থেকে ফাইল লোড হবে
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
);

// 🟢 FIX: মোড়ক ছাড়া সরাসরি ডেটা পাঠানো হচ্ছে, যাতে ফ্রন্টএন্ড সহজেই পড়তে পারে
app.get('/api/telemetry', (req, res) => {
    res.status(200).json(getTelemetryData());
});

// ==========================================
// 🟢 NEW: পেজ রিলোড দিলে চ্যাট হিস্ট্রি ফিরিয়ে দেওয়ার রাস্তা
// ==========================================
app.get('/api/history', async (req, res) => {
    try {
        const sessionId = req.query.sessionId || 'default_user';
        // মেমোরি ইঞ্জিন থেকে পুরনো কথাগুলো টেনে আনা হচ্ছে (সর্বোচ্চ ১০০টি মেসেজ)
        const history = await brain.memory.getRecentConversations(sessionId, 50); 
        
        res.status(200).json({
            success: true,
            history: history
        });
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to load memory"
        });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        logRequest();

        // ফ্রন্টএন্ড থেকে 'prompt' রিসিভ করা হচ্ছে
        const prompt = req.body.prompt;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: "Prompt missing"
            });
        }

        // ==========================================
        // ডাইরেক্ট জেমিনির বদলে এখন Brain কাজ করবে
        // ==========================================
        const brainResponse = await brain.handleRequest({
            type: 'CHAT_MESSAGE',
            content: prompt
        });

        // ঠিক আগের ফরম্যাটেই ফ্রন্টএন্ডকে রেসপন্স পাঠানো হচ্ছে
        res.status(200).json({
            success: true,
            response: brainResponse 
        });

    } catch (error) {
        console.error("AI Bridge Error:", error);

        res.status(500).json({
            success: false,
            error: "AI Engine Error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`ORBIS Live on Port: ${PORT}`);
});
