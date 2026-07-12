import express from 'express';
import { BrainController } from './brain/BrainController.js';
import path from 'path';

const app = express();
const brain = new BrainController();

app.use(express.json());

// তোমার প্রজেক্টের রুট ফোল্ডার (যেখানে index.html আছে) থেকে ফাইলগুলো লোড করবে
app.use(express.static(process.cwd()));

// যদি কেউ ডিরেক্ট লিংকে ঢোকে, তাকে index.html পেজটি দেখাবে
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
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
