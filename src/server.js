import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiProvider } from './brain/providers/GeminiProvider.js';

// ES Module এ __dirname সাপোর্ট করানোর জন্য
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// JSON ডেটা রিসিভ করার জন্য মিডলওয়্যার
app.use(express.json());

// আমাদের নতুন frontend ফোল্ডারটিকে সার্ভারের সাথে যুক্ত করা হলো
app.use(express.static(path.join(__dirname, '../frontend')));

// জেমিনি প্রোভাইডার ইনিশিয়ালাইজ করা (Render থেকে API Key নেবে)
const gemini = new GeminiProvider(process.env.GEMINI_API_KEY);

// এপিআই রুট - যেখান থেকে চ্যাটের ইনপুট আসবে এবং আউটপুট যাবে
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        // জেমিনি প্রোভাইডারের মাধ্যমে প্রসেস করা
        const responseText = await gemini.process(prompt);
        
        // সফল হলে ইউজারের কাছে শুধু টেক্সট পাঠানো
        res.json({ success: true, response: responseText });
    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ success: false, response: "Internal System Error" });
    }
});

// সার্ভার চালু করা
app.listen(port, () => {
    console.log(`ORBIS Server is online and listening on port ${port}`);
});
