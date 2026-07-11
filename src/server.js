import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTelemetryData } from './brain/telemetry.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/telemetry', (req, res) => {
    try {
        const telemetryStats = getTelemetryData();
        res.status(200).json({
            success: true,
            data: telemetryStats
        });
    } catch (error) {
        console.error("Telemetry Endpoint Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch telemetry' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        if (!userPrompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        console.log(`Received prompt: ${userPrompt}`);
        const mockAiResponse = `Hello! I received your message: "${userPrompt}". Gemini integration is standing by.`;

        res.status(200).json({ success: true, response: mockAiResponse });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`ORBIS Engine Live on Port: ${PORT}`);
});
