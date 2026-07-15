// js/ui-storage.js - Storage Engine & File Handler
window.StorageEngine = {
    // আগের ফাইল আপলোড লজিক অক্ষত রাখা হয়েছে
    handleUpload: function(file) {
        window.printLog && window.printLog('INFO', `StorageEngine: Processing file ${file.name} (${file.size} bytes)`);
        
        if (window.EventBus) {
            window.EventBus.emit('FileProcessingStarted', {
                fileName: file.name,
                fileType: file.type,
                timestamp: new Date().toISOString()
            });
        }
    },

    // ==========================================
    // 🟢 NEW (Priority 1): LIFETIME USER IDENTITY
    // ==========================================
    
    // সেশন সিকিউরভাবে সেভ করা
    saveSession: function(userData, token) {
        try {
            const sessionData = {
                uid: userData.uid,
                mobile: userData.mobile,
                role: userData.role || 'USER',
                token: token,
                timestamp: Date.now()
            };
            localStorage.setItem('orbis_active_session', JSON.stringify(sessionData));
            window.printLog && window.printLog('OK', `StorageEngine: Identity saved securely for ${userData.mobile}`);
            return true;
        } catch (e) {
            window.printLog && window.printLog('ERR', 'StorageEngine: Failed to save identity session.');
            return false;
        }
    },

    // বর্তমান সেশন রিড করা
    getSession: function() {
        try {
            const data = localStorage.getItem('orbis_active_session');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    // লগআউট বা সেশন ক্লিয়ার করা
    clearSession: function() {
        localStorage.removeItem('orbis_active_session');
        window.printLog && window.printLog('INFO', 'StorageEngine: Identity session cleared.');
    },

    // PWA অটো-রিস্টোর লজিক (পেজ রিফ্রেশ করলে লগইন চাইবে না)
    restoreIdentity: function() {
        const session = this.getSession();
        if (session && session.token) {
            window.printLog && window.printLog('OK', `StorageEngine: Persistent Identity restored [${session.uid}]`);
            return session;
        }
        return null;
    },

    // API কল করার সময় টোকেন পাওয়ার শর্টকাট
    getAuthToken: function() {
        const session = this.getSession();
        return session ? session.token : null;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.printLog && window.printLog('OK', 'Storage Engine Initialized.');
    
    // সিস্টেম লোড হওয়ার সাথেই আইডেন্টিটি রিস্টোর করার চেষ্টা করবে
    window.StorageEngine.restoreIdentity();
});
