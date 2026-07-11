const express = require('express');
const path = require('path');
const { getTelemetryData } = require('./brain/telemetry'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 

// ফ্রন্টএন্ড ফোল্ডারকে সার্ভারের সাথে সরাসরি হোস্ট করা হলো
app.use(express.static(path.join(__dirname, '../frontend')));

// কেউ মূল লিংকে (/) গেলে যেন index.html দেখতে পায়
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// --- টেলিমেট্রি এন্ডপয়েন্ট ---
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

// --- চ্যাট রিসিভার এন্ডপয়েন্ট ---
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
