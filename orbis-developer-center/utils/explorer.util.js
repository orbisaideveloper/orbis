import fs from 'node:fs';
import path from 'node:path';
import { scanDirectory } from './fileScanner.util.js';

export const runArchitectureScan = () => {
    const projectRoot = process.cwd();
    // ১. প্রজেক্টের সব ফাইলের লিস্ট নেওয়া
    const allFiles = scanDirectory(projectRoot);
    const existingFiles = new Set(allFiles.map(f => f.path.replace(projectRoot, '').replace(/\\/g, '/')));
    
    let connections = [];
    let brokenLinks = [];
    let referencedFiles = new Set();

    // ২. লিংক খোঁজার রিয়েল লজিক (HTML src, href, JS import, require, fetch)
    const linkPatterns = [
        /src=["']([^"']+\.(js|css|html|png|jpg|svg))["']/gi, 
        /href=["']([^"']+\.(js|css|html))["']/gi, 
        /import\s+.*?\s+from\s+["']([^"']+)["']/gi, 
        /require\(['"]([^"']+)['"]\)/gi,
        /fetch\(['"]([^"']+)['"]\)/gi 
    ];

    allFiles.forEach(fileObj => {
        if(!fileObj.path.endsWith('.js') && !fileObj.path.endsWith('.html')) return;
        
        const content = fs.readFileSync(fileObj.path, 'utf-8');
        const displayPath = fileObj.path.replace(projectRoot, '').replace(/\\/g, '/');
        const currentDir = path.posix.dirname(displayPath);

        linkPatterns.forEach(regex => {
            let match;
            while ((match = regex.exec(content)) !== null) {
                let linkedFile = match[1];
                
                // এক্সটার্নাল (ইন্টারনেট) লিংকগুলো ইগনোর করা
                if(linkedFile.startsWith('http') || linkedFile.startsWith('//')) continue; 
                
                // রিলেটিভ পাথ (./ বা ../) সলভ করে আসল পাথ বের করা
                let resolvedPath = path.posix.resolve(currentDir, linkedFile);
                if (!resolvedPath.startsWith('/')) resolvedPath = '/' + resolvedPath;

                connections.push({ from: displayPath, to: linkedFile });
                
                // ডেটাবেসে (Set) রেকর্ড রাখা যে এই ফাইলটাকে কেউ একজন কল করেছে
                referencedFiles.add(resolvedPath);

                // ৩. ব্রোকেন লিংক চেক করা (ফাইল কল হয়েছে কিন্তু ফোল্ডারে নেই)
                if (!existingFiles.has(resolvedPath) && !existingFiles.has(resolvedPath + '.js')) {
                    brokenLinks.push({ sourceFile: displayPath, missingTarget: linkedFile });
                }
            }
        });
    });

    // ৪. অরফান ফাইল চেক করা (যে ফাইলগুলো ফোল্ডারে আছে কিন্তু কেউ কোনোদিন কল করেনি)
    let orphanFiles = [];
    existingFiles.forEach(file => {
        if(file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css')) {
            if (!referencedFiles.has(file)) {
                // index.html বা app.js এর মতো মেইন এন্ট্রি ফাইলগুলো বাদ দেওয়া
                if(!file.includes('index.html') && !file.includes('app.js') && !file.includes('style.css')) {
                    orphanFiles.push(file);
                }
            }
        }
    });

    return {
        totalFilesScanned: existingFiles.size,
        totalConnectionsFound: connections.length,
        brokenLinks,
        orphanFiles
    };
};
