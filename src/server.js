// src/server.js
const express = require('express');
const app = express();
const BrainController = require('./brain/BrainController'); // তোমার সঠিক ফাইলের পাথ

app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
    try {
        const { content } = req.body;
        // আমরা এখন সরাসরি BrainController কে কল করছি
        const response = await BrainController.handleRequest({
            type: 'CHAT_MESSAGE',
            content: content
        });
        res.json({ status: 'success', data: response });
    } catch (error) {
        console.error('BrainController Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(process.env.PORT || 3000);
