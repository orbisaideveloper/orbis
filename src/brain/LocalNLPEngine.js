// src/brain/LocalNLPEngine.js

import { NlpManager } from 'node-nlp';
import { ORBIS_BLUEPRINT } from './OrbisBlueprint.js';

export class LocalNLPEngine {
    constructor() {
        // লাইটওয়েট NLP ম্যানেজার, যা র‍্যামে চলবে
        this.manager = new NlpManager({ languages: ['bn', 'en'], forceNER: true });
        this.isTrained = false;
        this.trainBrain();
    }

    async trainBrain() {
        // ১. সাধারণ কথাবার্তা (Greetings)
        this.manager.addDocument('bn', 'হাই', 'greetings.hello');
        this.manager.addDocument('bn', 'হ্যালো', 'greetings.hello');
        this.manager.addDocument('en', 'hello', 'greetings.hello');
        this.manager.addAnswer('bn', 'greetings.hello', 'হ্যালো! আমি ORBIS। আপনার লোকাল ব্রেইন সিস্টেম একদম রেডি।');

        // ২. আত্মপরিচয় (Identity)
        this.manager.addDocument('bn', 'তুমি কে', 'system.identity');
        this.manager.addDocument('bn', 'তোমার নাম কি', 'system.identity');
        this.manager.addDocument('bn', 'তোর পরিচয় কি', 'system.identity');
        this.manager.addAnswer('bn', 'system.identity', `আমি ${ORBIS_BLUEPRINT.identity}। আমাকে ডিজাইন করেছেন ${ORBIS_BLUEPRINT.developer}।`);

        // ৩. প্রজেক্ট আর্কিটেকচার (Architecture/Blueprint)
        this.manager.addDocument('bn', 'প্রজেক্টের ব্যাপারে বল', 'system.architecture');
        this.manager.addDocument('bn', 'তুমি কিভাবে তৈরি হয়েছ', 'system.architecture');
        this.manager.addDocument('bn', 'তোমার আর্কিটেকচার কি', 'system.architecture');
        
        // মডেল ট্রেইন করা হচ্ছে
        await this.manager.train();
        this.manager.save();
        this.isTrained = true;
        console.log("[LocalNLPEngine] 🧠 Local NLP Brain Trained and Running in RAM (Ultra-low latency)!");
    }

    async processLocally(text, sessionId) {
        if (!this.isTrained) return null;

        // ডেভেলপারের পরিচয় যাচাই (sessionId চেক করে)
        const isDeveloper = sessionId.toLowerCase().includes('ajay') || sessionId === 'developer';

        const response = await this.manager.process('bn', text);

        // যদি ইন্টেলিজেন্স কনফিডেন্স ৮০% এর বেশি হয়, তবেই সে নিজে উত্তর দেবে
        if (response.intent !== 'None' && response.score > 0.80) {
            
            // স্পেশাল সিকিউরিটি চেক: যদি আর্কিটেকচার জানতে চায়
            if (response.intent === 'system.architecture') {
                if (isDeveloper) {
                    return `হ্যালো বস! অরবিস আর্কিটেকচার রিপোর্ট:\n- মেইন কোর: ${ORBIS_BLUEPRINT.structure.src}\n- ডিসিশন মেকার: ${ORBIS_BLUEPRINT.structure["src/brain"]}\n- মেমোরি: ${ORBIS_BLUEPRINT.structure["src/brain/memory"]}`;
                } else {
                    return ORBIS_BLUEPRINT.securityRules; // অন্য ইউজার হলে রিজেক্ট করবে
                }
            }

            // সাধারণ কথার উত্তর
            return response.answer;
        }

        // কনফিডেন্স কম হলে (যেমন কোডিং প্রবলেম), null রিটার্ন করবে যাতে রাউটার জেমিনির কাছে পাঠায়
        return null; 
    }
}
