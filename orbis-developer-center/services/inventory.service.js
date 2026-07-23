import { scanDirectory } from '../utils/fileScanner.util.js';

export const getProjectInventory = () => {
    const projectRoot = process.cwd(); // প্রজেক্টের মেইন ফোল্ডার ট্র্যাক করবে
    const allFiles = scanDirectory(projectRoot);
    
    const stats = {
        totalFiles: allFiles.length,
        jsFiles: allFiles.filter(f => f.path.endsWith('.js')).length,
        htmlFiles: allFiles.filter(f => f.path.endsWith('.html')).length,
        cssFiles: allFiles.filter(f => f.path.endsWith('.css')).length,
        jsonFiles: allFiles.filter(f => f.path.endsWith('.json')).length,
        totalSizeMB: (allFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)
    };

    return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        data: stats
    };
};
