// 📝 frontend/js/database-service.js
// DIGILEDGER SHARED DATABASE SERVICE & SUPERVISOR QUEUE

// 🔴 আপনার আসল Supabase URL এবং ANON KEY এখানে বসাতে হবে 🔴
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL'; 
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// ১. ক্লায়েন্ট ইনিশিয়ালাইজ করা (যেহেতু index.html-এ Supabase CDN আছে)
if (window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('🟢 ORBIS: Frontend Supabase Client Initialized');
} else {
    console.error('❌ Supabase CDN missing in index.html!');
}

window.DatabaseService = {
    queueKey: 'orbis_offline_queue',

    // Party সেভ করার সেন্ট্রাল ফাংশন (প্রথমে Queue-তে যাবে)
    saveParty: async function(partyData) {
        try {
            if (!partyData.orb_id) {
                partyData.orb_id = 'ORB-PTY-' + Date.now().toString(36).toUpperCase();
            }

            partyData.sync_status = 'PENDING';
            partyData.updated_at = new Date().toISOString();

            let queue = this.getQueue();
            queue.push({ type: 'PARTY', data: partyData });
            localStorage.setItem(this.queueKey, JSON.stringify(queue));

            console.log('✅ Offline: Party added to Supervisor Queue', partyData);

            this.attemptSync();

            return { success: true, orb_id: partyData.orb_id, message: 'Saved Offline Successfully' };
        } catch (error) {
            console.error('❌ Database Error:', error);
            return { success: false, error: error.message };
        }
    },

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

        let remainingQueue = [...queue]; 

        for (let i = 0; i < queue.length; i++) {
            let item = queue[i];
            
            if (item.type === 'PARTY') {
                try {
                    item.data.sync_status = 'SYNCED';

                    // 🔗 Supabase-এ ডেটা পাঠানো (Upsert)
                    if (!window.supabaseClient) {
                        throw new Error("Supabase client not initialized. Check API keys.");
                    }

                    // 'parties' টেবিলে ডেটা পাঠানো হচ্ছে
                    const { data, error } = await window.supabaseClient
                        .from('parties')
                        .upsert([item.data]); 

                    if (error) throw error;

                    console.log(`✅ Synced Party: ${item.data.name}`);
                    
                    remainingQueue = remainingQueue.filter(q => q.data.orb_id !== item.data.orb_id);
                    
                } catch (err) {
                    console.error(`❌ Sync Failed for ${item.data.name}:`, err.message);
                    item.data.sync_status = 'PENDING';
                }
            }
        }

        localStorage.setItem(this.queueKey, JSON.stringify(remainingQueue));
        
        if (remainingQueue.length === 0) {
             console.log('🎉 Supervisor: All offline data synced successfully!');
        }
    },

    // 🟢 Party-master.js এর জন্য ডাটাবেস থেকে লিস্ট আনার ফাংশন
    getAllParties: async function() {
        // ইন্টারনেট থাকলে এবং Supabase কানেক্টেড থাকলে সরাসরি ডাটাবেস থেকে আনবে
        if (navigator.onLine && window.supabaseClient) {
            try {
                const { data, error } = await window.supabaseClient
                    .from('parties')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error && data) {
                    return data;
                }
            } catch (err) {
                console.error('❌ Failed to fetch from Supabase:', err.message);
            }
        }

        // অফলাইনে থাকলে বা ডাটাবেস থেকে আনতে না পারলে লোকাল কিউ থেকে ডেটা দেখাবে
        console.log('⚠️ Fetching parties from local offline queue');
        let queue = this.getQueue();
        return queue.filter(item => item.type === 'PARTY').map(item => item.data);
    }
};

// ইন্টারনেট কানেকশন ফিরে এলে অটোমেটিক সিঙ্ক (Supervisor) শুরু হবে
window.addEventListener('online', () => {
    console.log('🌐 Internet Restored! Supervisor waking up...');
    if (window.DatabaseService) window.DatabaseService.attemptSync();
});
