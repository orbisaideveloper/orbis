import express from 'express';
import { BrainController } from './brain/BrainController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES Module-এর জন্য ডিরেক্টরি পাথ সেট করা হচ্ছে
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const brain = new BrainController();

app.use(express.json());

// তোমার প্রজেক্টের মেইন ফোল্ডার (src ফোল্ডারের এক ধাপ বাইরে)
const rootDir = path.join(__dirname, '..');

// মেইন ফোল্ডার থেকে সব স্ট্যাটিক ফাইল (js, css) লোড করবে
app.use(express.static(rootDir));

// ওয়েবসাইটের মূল লিংকে গেলে index.html দেখাবে
app.get('/', (req, res) => {
    const indexPath = path.join(rootDir, 'index.html');
    
    // ফাইলটি আছে কি না চেক করে দেখা হচ্ছে
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // যদি তাও না পায়, তাহলে পরিষ্কারভাবে এরর মেসেজ দেখাবে
        res.status(404).send(`Error: index.html not found in ${rootDir}`);
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { content } = req.body;
        
        const response = await brain.handleRequest({
            type: 'CHAT_MESSAGE',
            content: content
        });
        
        res.json({ status: 'success', data: response });
    } catch (error) {
        console.error('BrainController Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ORBIS Server is running on port ${PORT}`);
});
