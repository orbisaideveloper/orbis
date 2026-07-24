import { scanDirectory } from '../utils/fileScanner.util.js';

export const getProjectInventory = () => {
    const projectRoot = process.cwd(); 
    const allFiles = scanDirectory(projectRoot);
    
    // ফাইলের পুরো পাথ থেকে মেইন ফোল্ডারের নামটা সরিয়ে সুন্দর করে সাজানো
    const formatPaths = (files) => files.map(f => f.path.replace(projectRoot, '').replace(/\\/g, '/'));

    const jsFiles = allFiles.filter(f => f.path.endsWith('.js'));
    const htmlFiles = allFiles.filter(f => f.path.endsWith('.html'));
    const cssFiles = allFiles.filter(f => f.path.endsWith('.css'));

    const stats = {
        totalFiles: allFiles.length,
        jsFilesCount: jsFiles.length,
        htmlFilesCount: htmlFiles.length,
        cssFilesCount: cssFiles.length,
        totalSizeMB: (allFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2),
        
        // ফাইলের লিস্টগুলো ফ্রন্টএন্ডে পাঠানোর জন্য
        jsList: formatPaths(jsFiles),
        htmlList: formatPaths(htmlFiles),
        cssList: formatPaths(cssFiles)
    };

    return {
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        data: stats
    };
};
