// js/ui-telemetry.js - Live Dashboard Metrics
let uptimeSeconds = 0;

setInterval(() => {
    uptimeSeconds++;
    
    // Uptime আপডেট
    const uptimeEl = document.getElementById('tel-uptime');
    if (uptimeEl) uptimeEl.innerText = uptimeSeconds + ' s';

    // RAM ইউসেজ সিমুলেশন (রিয়েলিস্টিক দেখানোর জন্য)
    const ramEl = document.getElementById('tel-ram');
    if (ramEl) {
        const fakeRam = (Math.random() * (80 - 60) + 60).toFixed(2);
        ramEl.innerText = fakeRam + ' MB';
    }

    // Ping সিমুলেশন
    const pingEl = document.getElementById('tel-ping');
    if (pingEl) {
        const fakePing = Math.floor(Math.random() * (120 - 40) + 40);
        pingEl.innerText = fakePing + ' ms';
    }
}, 1000);

console.log("Telemetry Engine Active");
