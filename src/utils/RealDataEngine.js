import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT_DIR = process.cwd();

export const scanProjectInventory = () => {
    let inventory = {
        totalJS: 0, totalHTML: 0, totalCSS: 0,
        totalRoutes: 0, totalModules: 0, totalComponents: 0,
        totalConfigs: 0, totalTests: 0,
        duplicateFiles: 0, unusedFiles: 'N/A (Requires AST)', missingFiles: 0,
        scannedDirectories: 0
    };

    const fileMap = new Set();

    const scanDir = (dir) => {
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
                        inventory.scannedDirectories++;
                        if (file.toLowerCase().includes('module')) inventory.totalModules++;
                        if (file.toLowerCase().includes('component')) inventory.totalComponents++;
                        scanDir(fullPath);
                    }
                } else {
                    if (fileMap.has(file)) inventory.duplicateFiles++;
                    fileMap.add(file);

                    if (file.endsWith('.js')) inventory.totalJS++;
                    if (file.endsWith('.html')) inventory.totalHTML++;
                    if (file.endsWith('.css')) inventory.totalCSS++;
                    if (file.includes('route')) inventory.totalRoutes++;
                    if (file.includes('config')) inventory.totalConfigs++;
                    if (file.endsWith('.test.js') || file.endsWith('.spec.js')) inventory.totalTests++;
                }
            }
        } catch (e) {
            // Ignore unreadable dirs
        }
    };

    scanDir(ROOT_DIR);
    return inventory;
};

export const getRealHealthData = () => {
    const memoryFree = Math.round(os.freemem() / 1024 / 1024);
    const memoryTotal = Math.round(os.totalmem() / 1024 / 1024);
    let pkgData = { dependencies: 'N/A', devDependencies: 'N/A' };
    
    try {
        const pkgPath = path.join(ROOT_DIR, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            pkgData.dependencies = pkg.dependencies ? Object.keys(pkg.dependencies).length : 0;
            pkgData.devDependencies = pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0;
        }
    } catch (e) {}

    return {
        memory: `${memoryFree}MB Free / ${memoryTotal}MB Total`,
        uptime: `${Math.round(os.uptime() / 60)} minutes`,
        os: os.type(),
        dependencies: pkgData.dependencies,
        devDependencies: pkgData.devDependencies
    };
};

export const getRealFileContext = (targetFile) => {
    try {
        const filePath = path.join(ROOT_DIR, targetFile);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            return {
                exists: true,
                totalLines: lines.length,
                snippet: lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n...' : ''),
                source: 'Filesystem'
            };
        }
    } catch (e) {}
    
    return { exists: false, totalLines: 'N/A', snippet: 'N/A (File not found)', source: 'Filesystem' };
};
