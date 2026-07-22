import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT_DIR = process.cwd();

// --- PHASE 6: REAL PROJECT INVENTORY ---
export const scanProjectInventory = () => {
    let inv = {
        JS: 0, HTML: 0, CSS: 0, JSON: 0,
        Routes: 0, Components: 0, Modules: 0, Utils: 0, Tests: 0,
        TotalScanned: 0, Missing: 'N/A', Duplicate: 0
    };
    const fileMap = new Set();

    const scan = (dir) => {
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    if (!['node_modules', '.git', 'dist'].includes(file)) {
                        if (file.toLowerCase().includes('route')) inv.Routes++;
                        if (file.toLowerCase().includes('component')) inv.Components++;
                        if (file.toLowerCase().includes('module')) inv.Modules++;
                        if (file.toLowerCase().includes('util')) inv.Utils++;
                        scan(fullPath);
                    }
                } else {
                    inv.TotalScanned++;
                    if (fileMap.has(file)) inv.Duplicate++;
                    fileMap.add(file);

                    if (file.endsWith('.js')) inv.JS++;
                    if (file.endsWith('.html')) inv.HTML++;
                    if (file.endsWith('.css')) inv.CSS++;
                    if (file.endsWith('.json')) inv.JSON++;
                    if (file.includes('.test.js') || file.includes('.spec.js')) inv.Tests++;
                }
            }
        } catch (e) {}
    };

    scan(ROOT_DIR);
    return inv;
};

// --- PHASE 3 & 7: REAL SYSTEM & DEPENDENCY DATA ---
export const getRealHealthData = () => {
    const memFree = Math.round(os.freemem() / 1024 / 1024);
    const memTotal = Math.round(os.totalmem() / 1024 / 1024);
    let deps = 0, devDeps = 0;
    
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
        deps = pkg.dependencies ? Object.keys(pkg.dependencies).length : 'N/A';
        devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 'N/A';
    } catch (e) {}

    return { memory: `${memFree}MB / ${memTotal}MB`, uptime: `${Math.round(os.uptime() / 60)}m`, deps, devDeps };
};

// --- PHASE 8 & 9: EVIDENCE PACK & SMART FIX PREVIEW ---
export const getRealFileContext = (targetFile) => {
    try {
        const filePath = path.join(ROOT_DIR, targetFile);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const imports = lines.filter(l => l.includes('import ')).join('\n') || 'N/A';
            return {
                exists: true,
                snippet: lines.slice(0, 5).join('\n'),
                dependencies: imports,
                lineCount: lines.length
            };
        }
    } catch (e) {}
    return { exists: false, snippet: 'N/A', dependencies: 'N/A', lineCount: 'N/A' };
};
