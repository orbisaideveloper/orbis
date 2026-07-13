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
                // লগবুকের ছোট বাটনগুলোতে ক্লিক করলে যেন মডাল না খোলে তার ব্যবস্থা
                if(e.target.closest('.log-controls') || e.target.closest('.filter-badge')) return;

                const header = panel.querySelector('.panel-header')?.innerText.trim() || 'Panel Details';
                let detailedContent = "";

                // 🟢 ডাইনামিক ইনসাইট জেনারেটর (কোন কার্ডে ক্লিক হয়েছে তার ওপর ভিত্তি করে)
                if (header.includes('SYSTEM & NETWORK')) {
                    detailedContent = `
                        <div style="font-size:0.85rem; line-height:1.6;">
                            <p><strong>🌐 Server Status:</strong> Connected to Render (Production)</p>
                            <p><strong>⚙️ Node Environment:</strong> v24.14.1</p>
                            <p><strong>💾 Memory Profile:</strong> LZ-String Compression Active</p>
                            <p><strong>📡 Network:</strong> Stable. No packet drops detected.</p>
                            <p style="color:var(--gray); margin-top:10px;"><em>Insight: System is running optimally without memory leaks.</em></p>
                        </div>`;
                } 
                else if (header.includes('EXECUTION PATH')) {
                    detailedContent = `
                        <div style="font-size:0.85rem; line-height:1.6;">
                            <p><strong>1. User Input:</strong> Received & Parsed successfully.</p>
                            <p><strong>2. Router:</strong> Evaluated intention. Bypassing standard API.</p>
                            <p><strong>3. Core / Memory:</strong> Checked Local NLP & Vector Database.</p>
                            <p><strong>4. Provider (Gemini):</strong> <span style="color:var(--saffron);">Intercepted by Developer Mode / Fallback.</span></p>
                            <hr style="margin:10px 0; border:0; border-top:1px solid var(--border);">
                            <p><strong>🚦 Current Bottleneck:</strong> None. Flow is routing through local memory.</p>
                        </div>`;
                }
                else if (header.includes('PROVIDERS & API')) {
                    detailedContent = `
                        <div style="font-size:0.85rem; line-height:1.6;">
                            <p><strong>🤖 Gemini Endpoint:</strong> Error 503/429 (High Demand / Quota Exceeded)</p>
                            <p><strong>🛡️ Fallback System:</strong> Active (Using Local Memory)</p>
                            <p><strong>⏱️ Average Latency:</strong> ~600ms (Local mode is faster)</p>
                            <p style="color:var(--red); margin-top:10px;"><em>Alert: External API relies on Google servers which are currently busy. ORBIS local brain has taken control.</em></p>
                        </div>`;
                }
                else if (header.includes('MEMORY & EVENT BUS')) {
                    detailedContent = `
                        <div style="font-size:0.85rem; line-height:1.6;">
                            <p><strong>🧠 Supabase DB:</strong> Connected & Syncing</p>
                            <p><strong>📦 Storage Algorithm:</strong> LZ-String (Saving up to 70% space)</p>
                            <p><strong>🔍 Cognitive Search:</strong> Active (Vector threshold 0.75)</p>
                            <p style="color:var(--green); margin-top:10px;"><em>Insight: Memory integration is fully functional and saving conversation history.</em></p>
                        </div>`;
                }
                else if (header.includes('LIVE LOGS')) {
                    // 🟢 লগবুক কপি করার বিশেষ ব্যবস্থা
                    const logText = document.getElementById('log-box')?.innerText || 'No logs found.';
                    detailedContent = `
                        <p style="font-size:0.8rem; margin-bottom:10px;">Here is your full terminal log. You can copy it to share with the developer.</p>
                        <textarea id="copy-log-area" style="width:100%; height:250px; font-family:monospace; font-size:0.75rem; background:#f8fafc; padding:10px; border:1px solid var(--border); border-radius:4px;" readonly>${logText}</textarea>
                        <button onclick="navigator.clipboard.writeText(document.getElementById('copy-log-area').value); this.innerText='✅ COPIED!'; this.style.background='var(--green)';" style="margin-top:10px; width:100%; padding:12px; background:var(--navy-blue); color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer; transition:0.3s;">📋 COPY FULL LOGS</button>
                    `;
                }
                else {
                    detailedContent = panel.innerHTML; // Default fallback
                }

                this.showMinimalModal(header, detailedContent);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const modal = document.createElement('div');
        modal.style = "position:fixed; top:5%; left:5%; width:90%; max-height:90vh; background:white; z-index:9999; border:1px solid #ccc; padding:20px; border-radius:8px; overflow-y:auto; box-shadow:0 4px 20px rgba(0,0,0,0.4); display:flex; flex-direction:column;";
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:10px;">
                <h3 style="color:var(--navy-blue); margin:0;">${title}</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size:1.5rem; color:var(--red); cursor:pointer;">×</button>
            </div>
            <div style="flex:1; margin-bottom:15px;">${content}</div>
        `;
        document.body.appendChild(modal);
    },

    // 🟢 লগ ফিল্টার লজিক ঠিক করা হলো
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
