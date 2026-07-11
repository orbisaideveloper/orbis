import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiProvider } from './brain/providers/GeminiProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// সার্ভার কখন চালু হয়েছে তার সময় ধরে রাখা (Uptime-এর জন্য)
const serverStartTime = Date.now();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);

// ==========================================
// 🚀 NEW: ORBIS System Telemetry Endpoint
// ==========================================
app.get('/api/telemetry', (req, res) => {
    // রিয়েল-টাইম র‍্যাম (RAM) এবং আপটাইম ক্যালকুলেশন
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    const memoryUsage = process.memoryUsage();

    res.json({
        success: true,
        data: {
            brainHub: {
                status: "ONLINE", // এপিআই রেসপন্স দিচ্ছে মানেই এটি অনলাইন
                uptime: uptimeSeconds,
                environment: process.env.NODE_ENV || "development",
                nodeVersion: process.version
            },
            provider: {
                active: "GeminiProvider",
                model: "gemini-3.5-flash",
                status: process.env.GEMINI_API_KEY ? "CONNECTED" : "MISSING_KEY"
            },
            memoryEngine: {
                status: "STANDBY", // ফেজ-৬ অনুযায়ী মেমরি ইঞ্জিন এখনও স্ট্যান্ডবাই
                ramUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024)
            },
            timestamp: new Date().toISOString()
        }
    });
});

// ==========================================
// 💬 Existing Chat Endpoint
// ==========================================
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const responseText = await gemini.process(prompt);
        res.json({ success: true, response: responseText });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ success: false, response: "Internal System Error" });
    }
});

app.listen(port, () => {
    console.log(`ORBIS Server is online on port ${port}`);
});
