import fs from 'node:fs';
import path from 'node:path';

export const scanDirectory = (dir) => {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        
        // node_modules এবং .git ফোল্ডার স্ক্যান করা থেকে বাদ দিচ্ছি যাতে সার্ভার স্লো না হয়
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(scanDirectory(file));
            }
        } else {
            results.push({ path: file, size: stat.size });
        }
    });
    return results;
};
