// frontend/js/ui-network.js
window.NetworkMonitor = {
    ping: async function() {
        const start = Date.now();
        try {
            // 🟢 ফিক্স: API রিকোয়েস্টের সাথে Authorization Token যুক্ত করা হলো
            const token = window.StorageEngine ? window.StorageEngine.getAuthToken() : null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // /api/telemetry কল করার সময় টোকেন পাঠানো হচ্ছে
            const response = await fetch('/api/telemetry', { headers }); 
            const data = await response.json();
            
            const end = Date.now();
            const latency = end - start;
            
            if (response.ok && window.Dashboard) {
                window.Dashboard.updateMetric('net-ping', `${latency} ms`);
                // যদি ব্যাকএন্ড থেকে telemetry ডেটা আসে, তবে তা Dashboard-এ আপডেট করে দেওয়া হলো
                if(data.telemetry) window.Dashboard.updateCockpitUI(data.telemetry); 
            } else {
                window.Dashboard.updateMetric('net-ping', `ERR (403)`);
            }
        } catch (e) {
            if(window.Dashboard) window.Dashboard.updateMetric('net-ping', `ERR`);
        }
    },

    init: function() {
        setInterval(() => this.ping(), 5000); // প্রতি ৫ সেকেন্ড পর পর পিং চেক
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.NetworkMonitor.init();
});
