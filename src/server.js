import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BrainHub } from './brain/core/BrainHub.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const brain = new BrainHub();

const server = http.createServer(async (req, res) => {
  // ১. কনসোলের HTML ফাইলটি লোড করার জন্য
  if (req.method === 'GET' && req.url === '/') {
    const htmlPath = path.join(__dirname, 'console', 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading Developer Preview Console UI');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } 
  // ২. কনসোল থেকে ব্রেইনে প্রম্পট পাঠানোর API API Gateway
  else if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { prompt } = JSON.parse(body);
        // BrainHub এর মাধ্যমে প্রসেস করা হচ্ছে
        const result = await brain.processRequest(prompt);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`[ORBIS Engine] Developer Preview Console live at http://localhost:${PORT}`);
});
