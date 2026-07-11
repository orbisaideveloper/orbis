const express = require('express');
const { getTelemetryData } = require('./brain/telemetry'); 

const app = express();
const PORT = process.env.PORT || 3000;

// ফ্রন্টএন্ড থেকে আসা ডেটা পড়ার জন্য এটি খুব দরকারি
app.use(express.json()); 

// --- টেলিমেট্রি এন্ডপয়েন্ট (আগের মতো) ---
app.get('/api/telemetry', (req, res) => {
    try {
        const telemetryStats = getTelemetryData();
        res.status(200).json({
            success: true,
            data: telemetryStats
        });
    } catch (error) {
        console.error("Telemetry Endpoint Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch telemetry data' 
        });
    }
});

// --- নতুন চ্যাট এন্ডপয়েন্ট (যেখানে ফ্রন্টএন্ডের মেসেজ আসবে) ---
app.post('/api/chat', async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        
        if (!userPrompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        console.log(`Received prompt from Frontend: ${userPrompt}`);

        // আপাতত টেস্ট করার জন্য একটি ডামি রেসপন্স (পরে এখানে Gemini যুক্ত হবে)
        const mockAiResponse = `Hello! I received your message: "${userPrompt}". Gemini integration is standing by.`;

        res.status(200).json({
            success: true,
            response: mockAiResponse
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`ORBIS Engine Live on Port: ${PORT}`);
});
