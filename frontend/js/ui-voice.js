// js/ui-voice.js - Speech to Text Engine
window.startVoiceEngine = function() {
    window.printLog('INFO', 'Voice: Listening...');
    const btn = document.getElementById('mic-btn');
    btn.classList.add('mic-active'); // মাইক বাটনে এনিমেশন চালু

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        window.printLog('ERR', 'Voice API is not supported in this browser.');
        btn.classList.remove('mic-active');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = document.getElementById('lang-select').value || 'bn-IN';
    
    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        document.getElementById('prompt-box').value = text;
        window.printLog('OK', 'Voice recognized: ' + text);
        btn.classList.remove('mic-active');
    };

    recognition.onerror = function(event) {
        window.printLog('ERR', 'Voice error: ' + event.error);
        btn.classList.remove('mic-active');
    };

    recognition.onend = function() {
        btn.classList.remove('mic-active');
    };

    recognition.start();
};
