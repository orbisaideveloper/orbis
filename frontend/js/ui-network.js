// js/ui-network.js
window.NetworkMonitor = {
    ping: async function() {
        const start = Date.now();
        try {
            await fetch('/api/telemetry'); // আপনারTelemetry এন্ডপয়েন্ট চেক করা হচ্ছে
            const end = Date.now();
            const latency = end - start;
            window.Dashboard.updateMetric('net-ping', `${latency} ms`);
        } catch (e) {
            window.Dashboard.updateMetric('net-ping', `ERR`);
        }
    },

    init: function() {
        setInterval(() => this.ping(), 5000); // প্রতি ৫ সেকেন্ড পর পর পিং চেক
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.NetworkMonitor.init();
});
