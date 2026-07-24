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

        let remainingQueue = [...queue]; // Queue এর একটি কপি তৈরি করা হলো

        for (let i = 0; i < queue.length; i++) {
            let item = queue[i];
            
            if (item.type === 'PARTY') {
                try {
                    // সিঙ্ক স্ট্যাটাস আপডেট করা
                    item.data.sync_status = 'SYNCED';

                    // 🔗 Supabase-এ ডেটা পাঠানো (Upsert)
                    // (আপনার প্রোজেক্টে Supabase ক্লায়েন্ট যদি অন্যভাবে ইনিশিয়ালাইজ করা থাকে, তবে window.supabase পরিবর্তন হতে পারে)
                    if (!window.supabase) {
                        console.error('❌ Supabase client (window.supabase) is missing!');
                        throw new Error("Supabase client not found");
                    }

                    const { data, error } = await window.supabase
                        .from('parties')
                        .upsert([item.data]); 

                    if (error) throw error;

                    console.log(`✅ Synced Party: ${item.data.name}`);
                    
                    // সফল হলে Queue থেকে মুছে ফেলা
                    remainingQueue = remainingQueue.filter(q => q.data.orb_id !== item.data.orb_id);
                    
                } catch (err) {
                    console.error(`❌ Sync Failed for ${item.data.name}:`, err.message);
                    // ফেইল করলে Queue-তেই রেখে দেওয়া হবে পরের বারের জন্য
                    item.data.sync_status = 'PENDING';
                }
            }
        }

        // লোকাল স্টোরেজে আপডেট করা Queue সেভ করা
        localStorage.setItem(this.queueKey, JSON.stringify(remainingQueue));
        
        if (remainingQueue.length === 0) {
             console.log('🎉 Supervisor: All offline data synced successfully!');
        }
    }
};

// ইন্টারনেট কানেকশন ফিরে এলে অটোমেটিক সিঙ্ক (Supervisor) শুরু হবে
window.addEventListener('online', () => {
    console.log('🌐 Internet Restored! Supervisor waking up...');
    if (window.DatabaseService) window.DatabaseService.attemptSync();
});
