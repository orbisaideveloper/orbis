import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BrainHub } from './brain/core/BrainHub.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const brain = new BrainHub();

const server = http.createServer(async (req, res) => {
  // Step 1: Stabilize Console (CORS & Security Headers)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Browser Preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  // Route 1: Load Developer Preview Console UI
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const htmlPath = path.join(__dirname, 'console', 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
      if (err) {
        // Step 2: Ensure errors return valid JSON
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Error loading Console UI' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } 
  // Route 2: API Gateway for BrainHub
  else if (req.method === 'POST' && req.url.includes('/api/chat')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsedBody = body ? JSON.parse(body) : {};
        const prompt = parsedBody.prompt || "Empty prompt";
        
        // Step 3: Verify BrainHub -> Decision -> MockProvider execution
        const result = await brain.processRequest(prompt);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (error) {
        console.error("[Server Error]", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });
  } 
  // Route 3: Catch-all MUST return valid JSON (Fulfilling Rule #2)
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: `Route ${req.method} ${req.url} not found` }));
  }
});

server.listen(PORT, () => {
  console.log(`[ORBIS Engine] Developer Preview Console live on port ${PORT}`);
});
