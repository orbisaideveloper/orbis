import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelemetryData } from './brain/telemetry.js'; 
import { GoogleGenAI } from '@google/genai'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 PERMANENT CACHE KILLER - ব্রাউজারকে সবসময় ফ্রেশ ফাইল নিতে বাধ্য করবে 🔥
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

let ai;
try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
    console.log("Warning: Gemini API Key not found.");
}

app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/telemetry', (req, res) => {
    try {
        res.status(200).json({ success: true, data: getTelemetryData() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch telemetry' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        if (!userPrompt) return res.status(400).json({ success: false, message: "Prompt is required" });

        if (!process.env.GEMINI_API_KEY || !ai) {
            return res.status(200).json({ 
                success: true, 
                response: `[System]: API Key missing. Set GEMINI_API_KEY in Render. I received: "${userPrompt}"` 
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: userPrompt,
        });

        res.status(200).json({ success: true, response: response.text });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ success: false, error: "AI Engine Processing Error" });
    }
});

app.listen(PORT, () => {
    console.log(`ORBIS Engine Live on Port: ${PORT}`);
});
