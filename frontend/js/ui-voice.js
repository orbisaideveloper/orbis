// js/ui-voice.js - Voice Engine (Connected to Router)
window.startVoiceEngine = function() {
    window.printLog('INFO', 'Voice: Initializing capture...');
    
    // ভয়েস ক্যাপচারের সিমুলেশন
    const simulatedVoiceText = "এটি ভয়েস ইনপুট থেকে আসা একটি কমান্ড।";
    
    // সরাসরি রাউটারের মাধ্যমে কমান্ড পাঠানো হচ্ছে
    window.WorkflowRouter.route({
        type: 'VOICE_COMMAND',
        content: simulatedVoiceText
    });
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog('OK', 'Voice Engine Initialized & Linked.');
});
