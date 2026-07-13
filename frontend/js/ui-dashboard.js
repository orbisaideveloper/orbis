window.Dashboard = {
    startTime: Date.now(),
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        this.setupLogFilters(); // ফিল্টার চালু করা হলো
        window.printLog('OK', 'Dashboard Diagnostic System Ready.');
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = Math.floor((Date.now() - this.startTime) / 1000) + ' s';
        }, 1000);
    },

    setupCardInteractions: function() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.addEventListener('click', (e) => {
                // ফিল্টার বাটন বা লগ কন্ট্রোলে ক্লিক করলে যেন মডাল না খোলে
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge')) return;

                const header = panel.querySelector('.panel-header')?.innerText.trim() || 'System Details';
                
                // 🟢 অরিজিনাল রিয়েল-টাইম কন্টেন্ট কপি করা হচ্ছে (আগের ভুয়া টেক্সট বাদ দেওয়া হলো)
                const originalContent = panel.innerHTML; 
                let extraTools = "";

                // 🟢 লগ প্যানেল হলে তার নিচে কপি বাটন যুক্ত করা
                if (header.includes('LIVE LOGS')) {
                    const logText = document.querySelector('.terminal')?.innerText || 'No logs found.';
                    extraTools = `
                        <div style="margin-top:15px; border-top:1px dashed var(--border); padding-top:15px;">
                            <textarea id="copy-log-area" style="width:100%; height:150px; font-family:monospace; font-size:0.75rem; background:#f8fafc; padding:10px; border:1px solid var(--border); border-radius:4px; margin-bottom:10px;" readonly>${logText}</textarea>
                            <button onclick="navigator.clipboard.writeText(document.getElementById('copy-log-area').value); this.innerText='✅ COPIED!'; this.style.background='var(--green)';" style="width:100%; padding:10px; background:var(--navy-blue); color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:0.3s;">📋 COPY FULL LOGS</button>
                        </div>
                    `;
                }

                // মডালে রিয়েল-টাইম ডেটা + এক্সট্রা টুলস পাঠানো
                this.showMinimalModal(header, originalContent + extraTools);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const modal = document.createElement('div');
        modal.style = "position:fixed; top:5%; left:5%; width:90%; max-height:90vh; background:white; z-index:9999; border:1px solid #ccc; padding:20px; border-radius:8px; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.4); display:flex; flex-direction:column;";
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--border); padding-bottom:10px;">
                <h3 style="color:var(--navy-blue); margin:0;">${title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.5rem; color:var(--red); cursor:pointer; font-weight:bold;">×</button>
            </div>
            <div style="flex:1;">${content}</div>
        `;
        document.body.appendChild(modal);
        
        // 🟢 মডাল ওপেন হওয়ার পর ফিল্টার বাটনগুলো যাতে মডালের ভেতরেও কাজ করে তার ব্যবস্থা
        if(title.includes('LIVE LOGS')) {
            this.setupLogFilters(); 
        }
    },

    // লগ ফিল্টার লজিক
    setupLogFilters: function() {
        const badges = document.querySelectorAll('.filter-badge');
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                badges.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.applyLogFilter(e.target.getAttribute('data-filter'));
            });
        });
    },

    applyLogFilter: function(filter) {
        const logs = document.querySelectorAll('.log-line');
        logs.forEach(log => {
            if (filter === 'ALL') {
                log.style.display = 'block';
            } else {
                // টেক্সট চেক করে ফিল্টার করা (case insensitive)
                if (log.innerText.toUpperCase().includes(filter.toUpperCase())) {
                    log.style.display = 'block';
                } else {
                    log.style.display = 'none';
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
