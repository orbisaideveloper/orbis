import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelemetryData, logRequest } from './brain/telemetry.js';
import { BrainController } from './brain/BrainController.js'; // Brain যুক্ত করা হলো

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

// ঠিক আগের মতোই তোমার frontend ফোল্ডার থেকে ফাইল লোড হবে (Error 404 আর আসবে না)
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
);

app.get('/api/telemetry', (req, res) => {
    res.status(200).json({
        success: true,
        data: getTelemetryData()
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        logRequest();

        // আগের মতোই ফ্রন্টএন্ড থেকে 'prompt' রিসিভ করা হচ্ছে
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
