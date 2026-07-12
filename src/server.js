import express from 'express';
import { BrainController } from './brain/BrainController.js';

const app = express();
const brain = new BrainController();

app.use(express.json());
app.use(express.static('public'));

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
