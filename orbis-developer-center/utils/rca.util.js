import fs from 'node:fs';
import { scanDirectory } from './fileScanner.util.js';

// 🛑 Stop Words: এই শব্দগুলো সিস্টেম ইগনোর করবে (কোডে খুঁজবে না)
const stopWords = new Set([
    'করে', 'করছে', 'করতে', 'বলতো', 'আছে', 'নাকি', 'একটু', 'চেক', 'কি', 'কেন', 'কীভাবে', 'কোথায়', 'টা', 'টি', 'গুলো', 'গুলা', 'দাও', 'দিয়ে', 'পুরা', 'পুরো', 'কোন', 'কোনো', 'কিভাবে',
    'please', 'check', 'the', 'is', 'are', 'a', 'to', 'do', 'how', 'why', 'what', 'where', 'find', 'search', 'tell', 'me', 'in', 'on', 'at'
]);

// 🧠 Smart NLP Dictionary: ইউজারের কথাকে টেকনিক্যাল টার্মে কনভার্ট করা
const keywordMap = {
    'লটারি': 'lottery', 'lottery': 'lottery',
    'ব্রেন': 'brain', 'brain': 'brain',
    'মডেল': 'model', 'model': 'model', 'মডেলের': 'model',
    'হেলদি': 'health', 'health': 'health', 'ঠিক': 'status',
    'পেমেন্ট': 'payment', 'payment': 'payment', 'টাকা': 'payment',
    'লগিন': 'login', 'login': 'login', 'অথ': 'auth',
    'ব্রেক': 'error', 'break': 'error', 'সমস্যা': 'error', 'fail': 'fail', 'ক্র্যাশ': 'crash',
    'কানেকশন': 'connect', 'connection': 'connect', 'নেটওয়ার্ক': 'network',
    'রাউট': 'route', 'route': 'route', 'এপিআই': 'api',
    'ক্যাশ': 'cache', 'cache': 'cache',
    'পার্টি': 'party', 'মাস্টার': 'master'
};

export const runRCA = (query) => {
    const projectRoot = process.cwd();
    const allFiles = scanDirectory(projectRoot).filter(f => f.path.endsWith('.js') || f.path.endsWith('.html'));

    const words = query.toLowerCase().split(/\s+/);
    const searchTerms = new Set();
    
    words.forEach(word => {
        // Stop-word হলে স্কিপ করো
        if (stopWords.has(word)) return;
        
        // ডিকশনারি থেকে টেকনিক্যাল শব্দ বের করা
        let matched = false;
        Object.keys(keywordMap).forEach(key => {
            if (word.includes(key)) {
                searchTerms.add(keywordMap[key]);
                matched = true;
            }
        });

        // যদি ডিকশনারিতে না থাকে, কিন্তু শব্দটা ৩ অক্ষরের বড় হয়, তবে সেটাকেও রাখো
        if (!matched && word.length > 3) {
            searchTerms.add(word);
        }
    });

    const termsArray = Array.from(searchTerms);
    let results = [];

    if (termsArray.length === 0) return results;

    // ডিপ কোড স্ক্যানিং
    allFiles.forEach(fileObj => {
        const content = fs.readFileSync(fileObj.path, 'utf-8');
        const lines = content.split('\n');
        const displayPath = fileObj.path.replace(projectRoot, '').replace(/\\/g, '/');

        lines.forEach((line, index) => {
            const cleanLine = line.toLowerCase();
            // সবগুলো টার্ম ম্যাচ না করলেও, যেকোনো একটা ইম্পর্টেন্ট টার্ম পেলেই ধরবে
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
