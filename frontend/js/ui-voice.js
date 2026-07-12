// ui-voice.js - Frontend Voice Engine API
let rec;
document.addEventListener('DOMContentLoaded', () => {
    try {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            rec = new SR();
            rec.onstart = () => { 
                if(getEl('mic-btn')) getEl('mic-btn').classList.add('mic-active'); 
                window.printLog('INFO', 'Voice Engine Active.');
            };
            rec.onresult = (e) => { 
                if(getEl('prompt-box')) getEl('prompt-box').value += (getEl('prompt-box').value ? ' ' : '') + e.results[0][0].transcript; 
            };
            rec.onend = () => { 
                if(getEl('mic-btn')) getEl('mic-btn').classList.remove('mic-active'); 
            };
            rec.onerror = () => {
                window.printLog('ERR', 'Voice Mapping Failed.');
            }
        }
    } catch(e) {}
});

window.startVoiceEngine = () => { 
    if(rec) { 
        rec.lang = getEl('lang-select')?.value || 'bn-IN'; 
        rec.start(); 
    } else {
        alert('Voice not supported in this browser.');
    }
};
