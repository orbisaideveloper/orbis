// js/ui-voice.js - Speech to Text Engine with Smart Bilingual Refiner

window.normalizeVoiceText = function(rawText) {
    let text = rawText.trim();
    
    // 🟢 NEW: Bilingual Dictionary (বাংলা + ইংরেজি মিক্সড কথার ভুলগুলো ঠিক করার ফিল্টার)
    const corrections = {
        // সাধারণ বাংলা ভুল
        "করতে পারবি": "করতে পারবে",
        "কি রে": "কী",
        "বলতো": "বল তো",
        "দ্যাখ": "দেখাও",
        
        // মিক্সড ল্যাঙ্গুয়েজ (Benglish) ও ইংরেজি উচ্চারণের ভুলগুলো
        "ওয়েদার টা": "ওয়েদারটা",
        "ট্রেনিং খবর": "ট্রেন্ডিং খবর", // Trending-কে Training শুনলে ঠিক করবে
        "আপডেট দে": "আপডেট দাও",
        "সার্চ কর": "সার্চ করো",
        "রিপোর্ট টা": "রিপোর্টটা",
        "হোয়াটস্যাপ": "WhatsApp",
        "ইউটিউব": "YouTube",
        "ফেসবুক": "Facebook",
        "মেইল টা": "মেইলটা"
    };
    
    for (const [wrong, right] of Object.entries(corrections)) {
        // g = global (সব জায়গায় খুঁজবে), i = case insensitive
        text = text.replace(new RegExp(wrong, 'gi'), right);
    }
    
    // ডাবল স্পেস বা অপ্রয়োজনীয় ফাঁকা জায়গা রিমুভ করা
    text = text.replace(/\s+/g, ' ');
    
    // বাক্যের শেষে কোনো ফালতু যতিচিহ্ন থাকলে সেটা ঠিক করা
    text = text.replace(/(\?|!|\.){2,}/g, '$1'); 
    
    return text;
};

window.startVoiceEngine = function() {
    window.printLog('INFO', 'Voice: Listening...');
    const btn = document.getElementById('mic-btn');
    
    if (btn) btn.classList.add('mic-active'); 

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        window.printLog('ERR', 'Voice API is not supported in this browser.');
        if (btn) btn.classList.remove('mic-active');
        alert("আপনার ব্রাউজার ভয়েস সাপোর্ট করে না। দয়া করে Google Chrome বা লেটেস্ট ব্রাউজার ব্যবহার করুন।");
        return;
    }

    const recognition = new SpeechRecognition();
    
    const langSelect = document.getElementById('lang-select');
    // bn-IN মডেলটি বাংলার সাথে সাধারণ ইংরেজি শব্দও বুঝতে পারে
    recognition.lang = langSelect ? langSelect.value : 'bn-IN';
    recognition.continuous = false; 
    
    recognition.onresult = function(event) {
        const rawText = event.results[0][0].transcript;
        
        // রিফাইনারের মাধ্যমে মিক্সড ভাষার ভুলগুলো ফিল্টার করা
        const cleanedText = window.normalizeVoiceText(rawText);
        
        const promptBox = document.getElementById('prompt-box');
        if (promptBox) {
            promptBox.value = cleanedText;
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
