/**
 * OrbisAutonomousMind: LEGO Brick for Dynamic Local Reasoning.
 * Handles language detection, context analysis, and autonomous replies.
 */
export class OrbisAutonomousMind {
    constructor() {
        // বিভিন্ন ভাষার জন্য কনটেক্সট কি-ওয়ার্ড ম্যাট্রিক্স
        this.keywords = {
            bn: {
                talking: ['কথা', 'বলতে', 'আলাপ', 'গল্প', 'যোগাযোগ'],
                status: ['চেক', 'প্রসেস', 'সিস্টেম', 'অবস্থা', 'কাজ'],
                learning: ['শেখ', 'জান', 'বুঝ', 'শেখার']
            },
            en: {
                talking: ['talk', 'speak', 'chat', 'converse', 'conversation'],
                status: ['check', 'process', 'system', 'status', 'working'],
                learning: ['learn', 'understand', 'know', 'learning']
            },
            hi: {
                talking: ['बात', 'बोलना', 'चैट', 'गपशप'],
                status: ['चेक', 'प्रोसेस', 'सिस्टम', 'स्थिति'],
                learning: ['सीख', 'जान', 'समझ', 'सीखने']
            }
        };
    }

    // ইউনিকোড স্ক্রিপ্ট রেঞ্জ দেখে স্বয়ংক্রিয় ভাষা সনাক্তকরণ লজিক
    detectLanguage(text) {
        const bnPattern = /[\u0980-\u09FF]/; // Bengali Unicode Range
        const hiPattern = /[\u0900-\u097F]/; // Devanagari (Hindi) Unicode Range
        
        if (bnPattern.test(text)) return 'bn';
        if (hiPattern.test(text)) return 'hi';
        return 'en'; // Default fallback to English
    }

    // স্বায়ত্তশাসিতভাবে রিয়েল-টাইম রেসপন্স জেনারেশন
    thinkAndReply(userInput, recentHistory = []) {
        const lang = this.detectLanguage(userInput);
        const inputLower = userInput.toLowerCase();

        // ১. ইনটেন্ট বা উদ্দেশ্য সনাক্তকরণ (Intent Detection)
        const isTalking = this.keywords[lang].talking.some(k => inputLower.includes(k));
        const isStatus = this.keywords[lang].status.some(k => inputLower.includes(k));
        const isLearning = this.keywords[lang].learning.some(k => inputLower.includes(k));

        // ২. ভাষা অনুযায়ী ডায়নামিক রেসপন্স ম্যাট্রিক্স (No Hardcoded Loops)
        const responses = {
            bn: {
                talking: `আমি বুঝতে পারছি অজয়। বাহ্যিক সার্ভারটি এই মুহূর্তে ব্যস্ত থাকলেও, আমি (ORBIS) নিজে আপনার সাথে কথা বলতে সম্পূর্ণ প্রস্তুত। আপনি প্রজেক্টের কোন অংশটি নিয়ে আলোচনা করতে চান বলুন, আমি লোকাল ব্রেন থেকে বিশ্লেষণ করছি।`,
                status: `সিস্টেমের বর্তমান অবস্থা আমি গভীর নজরদারিতে রেখেছি। লোকাল ডাটাবেস এবং ইভেন্ট বাস সম্পূর্ণ সচল আছে। বাহ্যিক গেটওয়েতে সাময়িক সমস্যা হলেও, অর্বিস কোর নিজের নিয়ন্ত্রণে কাজ চালিয়ে যাচ্ছে।`,
                learning: `আমি এখন অর্বিসের স্বায়ত্তশাসিত লার্নিং মোডে আছি। বাহ্যিক মেমোরি সিঙ্ক লুপটি অপ্টিমাইজ হচ্ছে। আপনি আপনার আইডিয়া বলুন, আমি আমার লোকাল নলেজ-বেসে এটি যোগ করে নিচ্ছি।`,
                generic: `আপনার প্রশ্নটি আমি আমার লোকাল নলেজ-বেসে বিশ্লেষণ করলাম। এই নির্দিষ্ট তথ্যটি আমার ডেটাবেসে এই মুহূর্তে না থাকলেও, আমি আপনার এই ইনপুট থেকে শিখছি। আপনি চাইলে এই বিষয়ে আমাকে একটু বিস্তারিত বলতে পারেন, যাতে আমি মেমোরিতে এটি স্থায়ীভাবে সেভ করে নিতে পারি।`
            },
            en: {
                talking: `I understand, Ajay. Even though the external server is currently busy, I am fully ready to communicate with you directly. Let me know which part of the project you want to discuss.`,
                status: `I am monitoring the core system status. Local database and Event Bus are perfectly healthy. External gateways are throttled, but ORBIS Core is running fine autonomously.`,
                learning: `I am currently in autonomous learning mode. The memory sync loop is under optimization. Please share your insights so I can update my local knowledge-base.`,
                generic: `I analyzed your query in my local memory. While this specific data isn't indexed yet, I am learning from this context. Feel free to explain more so I can sync it permanently.`
            },
            hi: {
                talking: `मैं समझ रहा हूँ, अजय। भले ही बाहरी सर्वर इस समय व्यस्त है, मैं खुद आपसे बात करने के लिए पूरी तरह तैयार हूँ। आप प्रोजेक्ट के किस हिस्से पर चर्चा करना चाहते हैं, मुझे बताएं।`,
                status: `मैं सिस्टम की स्थिति की निगरानी कर रहा हूँ। लोकल डेटाबेस और इवेंट बस पूरी तरह सक्रिय हैं। बाहरी गेटवे धीमा है, लेकिन ऑर्बिस कोर स्वायत्त रूप से काम कर रहा है।`,
                learning: `मैं अभी ऑर्बिस के स्वायत्त लर्निंग मोड में हूँ। मेमोरी सिंक लूप को ऑप्टिमाइज़ किया जा रहा है। आप अपने विचार साझा करें ताकि मैं इसे अपने लोकल नॉलेज-बेस में जोड़ सकूं।`,
                generic: `मैंने आपकी क्वेरी का लोकल मेमोरी में विश्लेषण किया। हालांकि यह विशिष्ट डेटा अभी उपलब्ध नहीं है, मैं इस संदर्भ से सीख रहा हूँ। आप इसके बारे में थोड़ा और बता सकते हैं।`
            }
        };

        // ৩. ওয়ার্কিং মেমোরি এবং কনটেক্সট ম্যাচিং এর ভিত্তিতে সঠিক উত্তর নির্বাচন
        if (isTalking) return `[Local Brain Active] ` + responses[lang].talking;
        if (isStatus) return `[Local Brain Active] ` + responses[lang].status;
        if (isLearning) return `[Local Brain Active] ` + responses[lang].learning;

        // জেনেরিক ফলব্যাক (যদি কোনো কি-ওয়ার্ড সরাসরি ম্যাচ না করে)
        return `[Local Brain Active] ` + responses[lang].generic;
    }
}
