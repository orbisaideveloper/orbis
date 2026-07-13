// src/brain/LocalNLPEngine.js

import { NlpManager } from 'node-nlp';
import { ORBIS_BLUEPRINT } from './OrbisBlueprint.js';

export class LocalNLPEngine {
    constructor() {
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

        // ৩. প্রজেক্ট আর্কিটেকচার (Architecture) - বাড়ানো ভেকাবুলারি
        this.manager.addDocument('bn', 'প্রজেক্টের ব্যাপারে বল', 'system.architecture');
        this.manager.addDocument('bn', 'তুমি কিভাবে তৈরি হয়েছ', 'system.architecture');
        this.manager.addDocument('bn', 'তোমার আর্কিটেকচার কি', 'system.architecture');
        this.manager.addDocument('bn', 'তুমি কি জানো আমার প্রজেক্টের ব্যাপারে', 'system.architecture');
        this.manager.addDocument('bn', 'তোমার মধ্যে রিসেন্ট কি আপডেট হয়েছে', 'system.architecture');
        this.manager.addDocument('bn', 'তোমার ব্রেনটাকে আমি ডেভলপ করেছি', 'system.architecture');
        
        await this.manager.train();
        this.manager.save();
        this.isTrained = true;
        console.log("[LocalNLPEngine] 🧠 Enhanced NLP Brain Trained!");
    }

    async processLocally(text, sessionId) {
        if (!this.isTrained) return null;

        const isDeveloper = sessionId.toLowerCase().includes('ajay') || sessionId === 'developer';
        const response = await this.manager.process('bn', text);

        // 🟢 কনফিডেন্স স্কোর ০.৬০ করা হলো (ফ্লেক্সিবল লার্নিংয়ের জন্য)
        if (response.intent !== 'None' && response.score > 0.60) {
            
            if (response.intent === 'system.architecture') {
                if (isDeveloper) {
                    return `হ্যালো বস! অরবিস আর্কিটেকচার রিপোর্ট:\n- মেইন কোর: ${ORBIS_BLUEPRINT.structure.src}\n- ডিসিশন মেকার: ${ORBIS_BLUEPRINT.structure["src/brain"]}\n- মেমোরি: ${ORBIS_BLUEPRINT.structure["src/brain/memory"]}`;
                } else {
                    return ORBIS_BLUEPRINT.securityRules;
                }
            }
            return response.answer;
        }
        return null; 
    }
}
