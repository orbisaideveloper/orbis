import express from 'express';
import { BrainController } from './brain/BrainController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const brain = new BrainController();

app.use(express.json());

// সার্ভার নিজে থেকে এই ফোল্ডারগুলোতে index.html খুঁজবে
const possibleDirs = [
    path.join(__dirname, '..'),          // মেইন ফোল্ডার (Repo Root)
    path.join(__dirname, '..', 'public'), // মেইন ফোল্ডারের ভেতর public ফোল্ডার
    __dirname                            // src ফোল্ডার
];

let staticDir = path.join(__dirname, '..'); // ডিফল্ট
let indexPath = '';

// স্ক্যানিং প্রসেস
for (const dir of possibleDirs) {
    const checkPath = path.join(dir, 'index.html');
    if (fs.existsSync(checkPath)) {
        staticDir = dir;
        indexPath = checkPath;
        break; // ফাইল পেয়ে গেলে খোঁজা বন্ধ করবে
    }
}

// যে ফোল্ডারে index.html পাবে, সেখান থেকেই css এবং js লোড করবে
app.use(express.static(staticDir));

app.get('/', (req, res) => {
    if (indexPath && fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        // যদি কোথাও না পায়, তবে কোন কোন ফোল্ডারে খুঁজেছে সেটা স্ক্রিনে দেখাবে
        res.status(404).send(`Error: index.html not found. Looked in: <br> ${possibleDirs.join('<br>')}`);
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
