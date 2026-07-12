// js/ui-telemetry.js - Real-time Dashboard Metrics & Log Engine

let isFetching = false;

// 🟢 নতুন: লাইভ লগ রেন্ডার করার ফাংশন
function renderLogs(logs) {
    // লক্ষ্য করুন: আপনার HTML-এ লগ দেখানোর বক্সের ID যদি 'runtime-logs' না হয়, তবে নিচের লাইনটি এডিট করে সঠিক ID বসিয়ে দেবেন।
    const logBox = document.getElementById('runtime-logs'); 
    if (!logBox) return;

    logBox.innerHTML = ''; // আগেরগুলো মুছে নতুন প্যাকেট বসানো হচ্ছে
    
    logs.forEach(log => {
        const logLine = document.createElement('div');
        logLine.style.marginBottom = '5px';
        logLine.style.fontSize = '12px';
        logLine.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

        // কালার কোডিং লজিক (Error = লাল, OK = সবুজ, INFO = নীল)
        if (log.type === 'ERROR' || log.message.includes('❌')) {
            logLine.style.color = '#ff4d4d'; 
        } else if (log.type === 'OK' || log.message.includes('✅')) {
            logLine.style.color = '#00e676'; 
        } else {
            logLine.style.color = '#64b5f6'; 
        }

        logLine.innerText = `[${log.time}] ${log.message}`;
        logBox.appendChild(logLine);
    });

    // নতুন লগ আসলে অটোমেটিক নিচে স্ক্রল করার জন্য
    logBox.scrollTop = logBox.scrollHeight;
}

// 🟢 আপডেট: ফেক ডেটার বদলে রিয়েল ডেটা ফেচিং
setInterval(async () => {
    if (isFetching) return;
    isFetching = true;

    const pingStart = Date.now();

    try {
        const response = await fetch('/api/telemetry'); // ব্যাকএন্ড থেকে ডেটা টানা
        if (response.ok) {
            const data = await response.json();
            
            // আসল Ping ক্যালকুলেশন
            const realPing = Date.now() - pingStart;

            // আসল Uptime আপডেট 
            const uptimeEl = document.getElementById('tel-uptime');
            if (uptimeEl && data.brainHub) uptimeEl.innerText = data.brainHub.uptime + ' s';

            // আসল RAM আপডেট
            const ramEl = document.getElementById('tel-ram');
            if (ramEl && data.memoryEngine) ramEl.innerText = data.memoryEngine.ramUsageMB + ' MB';

            // আসল Ping আপডেট
            const pingEl = document.getElementById('tel-ping');
            if (pingEl) pingEl.innerText = realPing + ' ms';

            // লগ আপডেট
            if (data.logs && data.logs.length > 0) {
                renderLogs(data.logs);
            }
        }
    } catch (error) {
        console.error("Telemetry Connection Lost:", error);
    } finally {
        isFetching = false;
    }
}, 2000); // প্রতি ২ সেকেন্ড পর পর আপডেট হবে

console.log("Real-time Telemetry Engine Active");
