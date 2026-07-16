// js/ui-voice.js - Speech to Text Engine with Smart Refiner

// 🟢 NEW: Smart Voice Refiner (১৯-২০ ভুলগুলো ঠিক করার ফিল্টার)
window.normalizeVoiceText = function(rawText) {
    let text = rawText.trim();
    
    // ১. সাধারণ বাংলা উচ্চারণের বা ভয়েস টাইপিংয়ের ভুলগুলো ঠিক করা (Dictionary)
    // আপনি চাইলে ভবিষ্যতে এখানে আরও শব্দ যোগ করতে পারবেন
    const corrections = {
        "করতে পারবি": "করতে পারবে",
        "কি রে": "কী",
        "বলতো": "বল তো",
        "ওয়েদার টা": "ওয়েদারটা",
        "কিরে": "কী",
        "দ্যাখ": "দেখাও",
        "ট্রেনিং খবর": "ট্রেন্ডিং খবর", // আগের সার্চের সেই ভুলটা ফিক্স করা হলো
        "বেস্ট": "সেরা"
    };
    
    for (const [wrong, right] of Object.entries(corrections)) {
        // g = global (সব জায়গায় খুঁজবে), i = case insensitive
        text = text.replace(new RegExp(wrong, 'gi'), right);
    }
    
    // ২. ডাবল স্পেস বা অপ্রয়োজনীয় ফাঁকা জায়গা রিমুভ করা
    text = text.replace(/\s+/g, ' ');
    
    // ৩. বাক্যের শেষে কোনো ফালতু যতিচিহ্ন থাকলে সেটা ঠিক করা
    text = text.replace(/(\?|!|\.){2,}/g, '$1'); 
    
    return text;
};

window.startVoiceEngine = function() {
    window.printLog('INFO', 'Voice: Listening...');
    const btn = document.getElementById('mic-btn');
    
    // মাইক বাটনে এনিমেশন চালু
    if (btn) btn.classList.add('mic-active'); 

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        window.printLog('ERR', 'Voice API is not supported in this browser.');
        if (btn) btn.classList.remove('mic-active');
        alert("আপনার ব্রাউজার ভয়েস সাপোর্ট করে না। দয়া করে Google Chrome বা লেটেস্ট ব্রাউজার ব্যবহার করুন।");
        return;
    }

    const recognition = new SpeechRecognition();
    
    // ইউজার যদি ল্যাঙ্গুয়েজ সিলেক্ট করে থাকে সেটা নেবে, না হলে ডিফল্ট বাংলা (bn-IN)
    const langSelect = document.getElementById('lang-select');
    recognition.lang = langSelect ? langSelect.value : 'bn-IN';
    
    // একটানা শোনার জন্য false রাখা হয়েছে, ইউজার চুপ করলে নিজে থেকেই থেমে যাবে
    recognition.continuous = false; 
    
    recognition.onresult = function(event) {
        const rawText = event.results[0][0].transcript;
        
        // 🟢 কাঁচা টেক্সটকে রিফাইনারের মাধ্যমে ফিল্টার করে ইনপুট বক্সে বসানো
        const cleanedText = window.normalizeVoiceText(rawText);
        
        const promptBox = document.getElementById('prompt-box');
        if (promptBox) {
            promptBox.value = cleanedText;
            // কার্সরটাকে একদম টেক্সটের শেষে নিয়ে যাওয়ার জন্য
            promptBox.focus();
            promptBox.setSelectionRange(cleanedText.length, cleanedText.length);
        }
        
        window.printLog('OK', 'Voice recognized & cleaned: ' + cleanedText);
        if (btn) btn.classList.remove('mic-active');
    };

    recognition.onerror = function(event) {
        window.printLog('ERR', 'Voice error: ' + event.error);
        if (btn) btn.classList.remove('mic-active');
    };

    recognition.onend = function() {
        if (btn) btn.classList.remove('mic-active');
    };

    recognition.start();
};
