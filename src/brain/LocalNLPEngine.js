// src/brain/LocalNLPEngine.js
/**
 * LocalNLPEngine: Handles local routing and vocabulary mapping.
 * Updated: Phase 8.0 - Dynamic Language Processing and Format Alignment.
 */
import { NlpManager } from 'node-nlp';
import { ORBIS_BLUEPRINT } from './OrbisBlueprint.js';

export class LocalNLPEngine {
    constructor() {
        // বাংলা এবং ইংরেজি দুটি ভাষাই ম্যানেজার হ্যান্ডেল করবে
        this.manager = new NlpManager({ languages: ['bn', 'en'], forceNER: true });
        this.isTrained = false;
        this.trainBrain();
    }

    // ইউনিকোড স্ক্রিপ্ট রেঞ্জ দেখে ইনপুটের ভাষা চেনার হালকা লজিক
    detectLanguage(text) {
        const bnPattern = /[\u0980-\u09FF]/; // Bengali Unicode Range
        return bnPattern.test(text) ? 'bn' : 'en';
    }

    async trainBrain() {
        // ১. সাধারণ কথাবার্তা (Greetings)
        this.manager.addDocument('bn', 'হাই', 'greetings.hello');
        this.manager.addDocument('bn', 'হ্যালো', 'greetings.hello');
        this.manager.addDocument('en', 'hello', 'greetings.hello');
        this.manager.addDocument('en', 'hi', 'greetings.hello');
        this.manager.addAnswer('bn', 'greetings.hello', 'হ্যালো! আমি ORBIS। আপনার লোকাল ব্রেইন সিস্টেম একদম রেডি।');
        this.manager.addAnswer('en', 'greetings.hello', 'Hello! I am ORBIS. Your local brain system is completely ready.');

        // ২. আত্মপরিচয় (Identity)
        this.manager.addDocument('bn', 'তুমি কে', 'system.identity');
        this.manager.addDocument('bn', 'তোমার নাম কি', 'system.identity');
        this.manager.addDocument('en', 'who are you', 'system.identity');
        this.manager.addDocument('en', 'what is your name', 'system.identity');
        this.manager.addAnswer('bn', 'system.identity', `আমি ORBIS, একটি ইউনিভার্সাল এআই ইঞ্জিনিয়ারিং প্ল্যাটফর্ম। আমাকে ডিজাইন করেছেন অজয়।`);
        this.manager.addAnswer('en', 'system.identity', `I am ORBIS, a Universal AI Engineering Platform. I am designed by Ajay.`);

        // ৩. প্রজেক্ট আর্কিটেকচার ও ডেভলপমেন্ট (Architecture & Development)
        const vocab = [
            'প্রজেক্টের ব্যাপারে বল', 'তুমি কিভাবে তৈরি হয়েছ', 'তোমার আর্কিটেকচার কি',
            'তুমি কি জানো আমার প্রজেক্টের ব্যাপারে', 'তোমার মধ্যে রিসেন্ট কি আপডেট হয়েছে',
            'তোমার ব্রেনটাকে আমি ডেভলপ করেছি', 'ব্রেনটা কে আরো ডেভলপমেন্ট আরো ইন্টেলিজেন্ট বানানোর চেষ্টা করছি'
        ];
        vocab.forEach(phrase => this.manager.addDocument('bn', phrase, 'system.architecture'));

        const enVocab = [
            'tell me about the project', 'how are you built', 'what is your architecture',
            'what do you know about my project', 'recent updates', 'developing your brain'
        ];
        enVocab.forEach(phrase => this.manager.addDocument('en', phrase, 'system.architecture'));
        
        await this.manager.train();
        this.manager.save();
        this.isTrained = true;
        console.log("[LocalNLPEngine] 🧠 Enhanced NLP Brain Trained!");
    }

    async processLocally(text, sessionId) {
        if (!this.isTrained || !text) return null;

        const isDeveloper = sessionId.toLowerCase().includes('ajay') || sessionId === 'developer' || sessionId === 'default_user';
        const detectedLang = this.detectLanguage(text);
        
        // 🟢 ফিক্স: হার্ডকোডেড 'bn' তুলে দিয়ে ডায়নামিক ভাষা পাস করা হলো
        const response = await this.manager.process(detectedLang, text);

        // 🟢 কনফিডেন্স স্কোর ০.৬০ ফ্লেক্সিবিলিটি
        if (response.intent !== 'None' && response.score > 0.60) {
            let finalReply = response.answer;
            
            if (response.intent === 'system.architecture') {
                if (isDeveloper) {
                    finalReply = (detectedLang === 'bn') 
                        ? `হ্যালো বস! অর্বিস আর্কিটেকচার রিপোর্ট অ্যাক্টিভ। আমরা এখন Phase 6B-তে ককপিট ড্যাশবোর্ড এবং লোকাল স্বায়ত্তশাসিত মাইন্ডের সিঙ্ক্রোনাইজেশন নিয়ে কাজ করছি।`
                        : `Hello Boss! ORBIS Architecture Report Active. We are currently working on Phase 6B, optimizing the Cockpit Dashboard and Autonomous Local Mind.`;
                } else {
                    finalReply = ORBIS_BLUEPRINT?.securityRules || "Access Denied.";
                }
            }
            
            // 🟢 ফিক্স: BrainController যাতে ডেটা রিড করতে পারে, তাই স্ট্রাকচার্ড অবজেক্ট রিটার্ন করা হচ্ছে
            return {
                text: finalReply,
                confidence: response.score
            };
        }
        return null; 
    }
}
