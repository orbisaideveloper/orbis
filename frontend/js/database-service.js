// 📝 frontend/js/database-service.js
// DIGILEDGER SHARED DATABASE SERVICE & SUPERVISOR QUEUE

window.DatabaseService = {
    queueKey: 'orbis_offline_queue',

    // Party সেভ করার সেন্ট্রাল ফাংশন (প্রথমে Queue-তে যাবে)
    saveParty: async function(partyData) {
        try {
            // ১. ORB-ID তৈরি করা (যদি না থাকে)
            if (!partyData.orb_id) {
                partyData.orb_id = 'ORB-PTY-' + Date.now().toString(36).toUpperCase();
            }

            // ডিরেক্টিভ অনুযায়ী স্ট্যাটাস PENDING মার্ক করা
            partyData.sync_status = 'PENDING';
            partyData.updated_at = new Date().toISOString();

            // ২. লোকাল স্টোরেজে (Supervisor Queue) সেভ করা
            let queue = this.getQueue();
            queue.push({ type: 'PARTY', data: partyData });
            localStorage.setItem(this.queueKey, JSON.stringify(queue));

            console.log('✅ Offline: Party added to Supervisor Queue', partyData);

            // ৩. ব্যাকগ্রাউন্ড সিঙ্ক করার চেষ্টা
            this.attemptSync();

            return { success: true, orb_id: partyData.orb_id, message: 'Saved Offline Successfully' };
        } catch (error) {
            console.error('❌ Database Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Queue থেকে পেন্ডিং ডেটা বের করা
    getQueue: function() {
        try { 
            return JSON.parse(localStorage.getItem(this.queueKey)) || []; 
        } catch(e) { 
            return []; 
        }
    },

    // ব্যাকগ্রাউন্ডে Supabase-এ সিঙ্ক করবে (Supervisor)
    attemptSync: async function() {
        if (!navigator.onLine) {
            console.log('⚠️ Offline: Sync paused. Waiting for internet...');
            return;
        }

        let queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`🔄 Supervisor: Syncing ${queue.length} pending records to Supabase...`);

        // *পরবর্তী ধাপে এখানে আমরা Supabase-এ ডেটা পাঠানোর আসল API কোডটি লিখব*
    }
};

// ইন্টারনেট কানেকশন ফিরে এলে অটোমেটিক সিঙ্ক (Supervisor) শুরু হবে
window.addEventListener('online', () => {
    console.log('🌐 Internet Restored! Supervisor waking up...');
    if (window.DatabaseService) window.DatabaseService.attemptSync();
});
