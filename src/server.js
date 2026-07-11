const express = require('express');
// নতুন টেলিমেট্রি মডিউল ইমপোর্ট করা হলো
const { getTelemetryData } = require('./brain/telemetry'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- আপনার অন্যান্য কোড (Gemini API, CORS ইত্যাদি) এখানে থাকবে ---

// পরিচ্ছন্ন /api/telemetry এন্ডপয়েন্ট
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

app.listen(PORT, () => {
    console.log(`ORBIS Engine Live on Port: ${PORT}`);
});
