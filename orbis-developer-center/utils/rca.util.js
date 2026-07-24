import fs from 'node:fs';
import { scanDirectory } from './fileScanner.util.js';

// 🧠 Smart NLP Dictionary: বাংলা/ইংরেজি কথাকে কোডের ভাষায় ট্রান্সলেট করবে
const keywordMap = {
    'লটারি': 'lottery', 'lottery': 'lottery',
    'ব্রেন': 'brain', 'brain': 'brain',
    'মডেল': 'model', 'model': 'model',
    'হেলদি': 'health', 'health': 'health', 'ঠিক': 'status',
    'পেমেন্ট': 'payment', 'payment': 'payment',
    'লগিন': 'login', 'login': 'login',
    'ব্রেক': 'error', 'break': 'error', 'সমস্যা': 'error', 'fail': 'fail',
    'কানেকশন': 'connect', 'connection': 'connect',
    'রাউট': 'route', 'route': 'route', 'এপিআই': 'api',
    'ক্যাশ': 'cache', 'cache': 'cache'
};

export const runRCA = (query) => {
    const projectRoot = process.cwd();
    const allFiles = scanDirectory(projectRoot).filter(f => f.path.endsWith('.js') || f.path.endsWith('.html'));

    // ইউজারের কথা থেকে দরকারি শব্দ বের করা
    const words = query.toLowerCase().split(/\s+/);
    const searchTerms = new Set();
    
    words.forEach(w => {
        if (w.length > 2) searchTerms.add(w); 
        Object.keys(keywordMap).forEach(key => {
            if (w.includes(key)) searchTerms.add(keywordMap[key]);
        });
    });

    const termsArray = Array.from(searchTerms).filter(t => t.length > 2);
    let results = [];

    if (termsArray.length === 0) return results;

    // পুরো প্রজেক্ট স্ক্যান করে ওই রিলেটেড লাইনগুলো খুঁজে বের করা
    allFiles.forEach(fileObj => {
        const content = fs.readFileSync(fileObj.path, 'utf-8');
        const lines = content.split('\n');
        const displayPath = fileObj.path.replace(projectRoot, '').replace(/\\/g, '/');

        lines.forEach((line, index) => {
            const cleanLine = line.toLowerCase();
            const match = termsArray.some(term => cleanLine.includes(term));
            
            if (match) {
                results.push({
                    file: displayPath,
                    line: index + 1,
                    code: line.trim()
                });
            }
        });
    });

    return results;
};
