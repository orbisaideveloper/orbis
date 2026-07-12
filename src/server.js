import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelemetryData, logRequest } from './brain/telemetry.js'; 
import { GoogleGenAI } from '@google/genai'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 PERMANENT CACHE KILLER - ব্রাউজারকে প্রতিবার ফ্রেশ ফাইল লোড করতে বাধ্য করবে
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

let ai;
try { 
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
} catch (e) { 
    console.log("Warning: Gemini API Key missing."); 
}

app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));

app.get('/api/telemetry', (req, res) => {
    res.status(200).json({ success: true, data: getTelemetryData() });
});

app.post('/api/chat', async (req, res) => {
    try {
        logRequest();
        const prompt = req.body.prompt;
        if (!prompt) return res.status(400).json({ success: false, message: "Prompt missing" });

        if (!process.env.GEMINI_API_KEY || !ai) {
            return res.status(200).json({ 
                success: true, 
                response: `[ORBIS Dev Mode]: API Key is missing in Render Settings. Received prompt: "${prompt}"` 
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
        });

        res.status(200).json({ success: true, response: response.text });
    } catch (error) {
        console.error("AI Bridge Error:", error);
        res.status(500).json({ success: false, error: "AI Engine Error" });
    }
});

app.listen(PORT, () => console.log(`ORBIS Live on Port: ${PORT}`));
