import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiProvider } from './brain/providers/GeminiProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// ⚙️ ORBIS CORE TELEMETRY TRACKERS
// ==========================================
const serverStartTime = Date.now();
let totalRequests = 0;
let errorCount = 0;
let activeWorkflowStep = "IDLE"; // রিয়েল-টাইম ওয়ার্কফ্লো ট্র্যাকিং

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);

// ==========================================
// 📊 MASTER TELEMETRY ENDPOINT (PHASE 6)
// ==========================================
app.get('/api/telemetry', (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    const memoryUsage = process.memoryUsage();

    res.json({
        success: true,
        data: {
            system: {
                phase: "Phase 6",
                buildType: "Developer Preview",
                environment: process.env.NODE_ENV || "development"
            },
            brainHub: {
                status: "ONLINE",
                uptime: uptimeSeconds,
                activeWorkflow: activeWorkflowStep
            },
            provider: {
                active: "GeminiProvider",
                model: "gemini-3.5-flash",
                status: process.env.GEMINI_API_KEY ? "CONNECTED" : "MISSING_KEY",
                available: ["Gemini"]
            },
            memoryEngine: {
                status: "STANDBY",
                ramUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                userMemory: 0,
                sessionMemory: 0
            },
            performance: {
                totalRequests: totalRequests,
                errorCount: errorCount
            },
            timestamp: new Date().toISOString()
        }
    });
});

// ==========================================
// 💬 CHAT ENDPOINT WITH WORKFLOW TRACKING
// ==========================================
app.post('/api/chat', async (req, res) => {
    totalRequests++; // রিকোয়েস্ট কাউন্ট আপডেট
    const requestId = `REQ-${Date.now()}`;
    
    // ওয়ার্কফ্লো মনিটরের জন্য স্ট্যাটাস চেঞ্জ
    activeWorkflowStep = "BrainHub -> Provider Registry -> Gemini";

    try {
        const { prompt } = req.body;
        const responseText = await gemini.process(prompt);
        
        activeWorkflowStep = "IDLE"; // প্রসেসিং শেষে আবার আইডিয়াল
        res.json({ success: true, requestId, response: responseText });
    } catch (error) {
        errorCount++; // এরর কাউন্ট আপডেট
        activeWorkflowStep = "ERROR: Provider Failure";
        console.error(`[${requestId}] Chat API Error:`, error);
        res.status(500).json({ success: false, requestId, response: "Internal System Error" });
    }
});

app.listen(port, () => {
    console.log(`ORBIS Server is online on port ${port}`);
});
