import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiProvider } from './brain/providers/GeminiProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// আমাদের নতুন ইন্ডিয়ান থিমের frontend ফোল্ডারকে যুক্ত করা হলো
app.use(express.static(path.join(__dirname, '../frontend')));

const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);

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
