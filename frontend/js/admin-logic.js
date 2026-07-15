// 🩺 SELF-HEALING LOGIC (Emergency Cache Wiping)
function triggerSelfHealing() {
    console.log("[Self-Healing] Activating emergency cache wipe...");
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) { registration.unregister(); }
        });
    }
    caches.keys().then((names) => { names.forEach(name => caches.delete(name)); });
    localStorage.removeItem('orbis_system_version');
    alert('Self-Healing Complete! The system will now reboot.');
    setTimeout(() => { window.location.reload(true); }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    // 🟢 ERROR DETECTION
    if (typeof window.ORBIS_ADMIN === 'undefined') {
        const grid = document.getElementById('dynamic-plugin-grid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; background:#fff0f0; border:2px dashed #ff4d4d; padding:30px; border-radius:12px; text-align:center;">
                    <div style="font-size:3rem; margin-bottom:10px;">🩺</div>
                    <h3 style="color:#ff4d4d; margin-top:0;">System UI Pipeline Blocked</h3>
                    <p style="color:#d32f2f;">A background cache conflict prevented core registry files from loading.</p>
                    <button onclick="triggerSelfHealing()" style="background:#ff4d4d; color:#fff; border:none; padding:12px 24px; border-radius:6px; font-weight:bold; cursor:pointer;">⚡ Run Self-Healing Sequence</button>
                </div>
            `;
        }
        return; 
    }

    // 🟢 NORMAL EXECUTION
    window.ORBIS_ADMIN.registerProvider('sys-metrics', async () => {
        try {
            const response = await fetch('/api/admin/health');
            const result = await response.json();
            if(result.status === 'OK') {
                const ramMB = Math.round(result.memoryUsage.rss / (1024 * 1024));
                return { success: true, data: { ram: ramMB, ping: 12, activeUsers: result.activeUsers || 0, uptime: Math.floor(result.uptime) } };
            }
            throw new Error('API Failed');
        } catch (error) { return { success: false, data: { ram: '--', ping: '--', activeUsers: '--', uptime: 0 } }; }
    });
    startTelemetryPolling();
    renderPlugins();
});

function renderPlugins() {
    const grid = document.getElementById('dynamic-plugin-grid');
    if (!grid) return;
    window.ORBIS_ADMIN.plugins.forEach(plugin => {
        const card = document.createElement('div');
        card.className = 'admin-card';
        if(plugin.id === 'plugin-public') { card.style.border = '2px solid #e2e8f0'; card.style.background = 'transparent'; card.style.boxShadow = 'none'; }
        card.onclick = () => openPanel(plugin.id);
        card.innerHTML = `
            <div class="card-icon">${plugin.icon}</div>
            <div class="card-title">${plugin.name}</div>
            <div class="card-desc">${plugin.desc}</div>
            <div class="card-footer">
                <span class="card-status ${plugin.statusClass}">${plugin.statusText}</span>
                <span style="color:var(--text-muted); font-size:1.2rem;">➔</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

let localUptimeSeconds = 0; let activeRadarInterval = null; 

function startTelemetryPolling() {
    setInterval(async () => {
        const response = await window.ORBIS_ADMIN.fetchData('sys-metrics');
        if(response && response.success) {
            document.getElementById('live-ram').innerText = response.data.ram;
            document.getElementById('live-ping').innerText = response.data.ping;
            document.getElementById('live-users').innerText = response.data.activeUsers;
            let currentUptime = response.data.uptime || ++localUptimeSeconds;
            const h = Math.floor(currentUptime / 3600).toString().padStart(2, '0');
            const m = Math.floor((currentUptime % 3600) / 60).toString().padStart(2, '0');
            const s = (currentUptime % 60).toString().padStart(2, '0');
            document.getElementById('live-uptime').innerText = `${h}:${m}:${s}`;
        }
    }, 1000);
}

async function fetchSystemState() {
    try { const res = await fetch('/api/admin/system-state'); const data = await res.json(); return data.state; } catch(e) { return null; }
}

async function openPanel(pluginId) {
    if (pluginId === 'plugin-public') { window.location.href = '/'; return; }
    const plugin = window.ORBIS_ADMIN.plugins.get(pluginId);
    document.getElementById('main-dashboard').style.display = 'none';
    document.getElementById('detail-panel').style.display = 'flex';
    document.getElementById('panel-title-text').innerText = plugin.name;
    const contentArea = document.getElementById('panel-content-area');
    
    if (pluginId === 'plugin-cockpit') {
        contentArea.style.padding = '0';
        contentArea.innerHTML = `<iframe src="/index.html?cockpit_mode=true" style="width: 100%; height: 100%; border: none; background: #0f172a;"></iframe>`;
    } 
    else if (pluginId === 'plugin-radar') {
        contentArea.style.padding = '20px';
        contentArea.innerHTML = `
            <div style="background:#fff; padding:20px; border-radius:10px; max-width:900px; margin:0 auto; box-shadow: var(--shadow);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:15px;">
                    <h3 style="margin:0; color:var(--text-dark);">Active Sessions Map</h3>
                    <span style="font-size:0.85rem; background:#dcfce7; color:var(--green); padding:4px 10px; border-radius:20px; font-weight:bold;">
                        <span class="live-dot"></span> Live Tracking
                    </span>
                </div>
                <div id="radar-table-container">
                    <p style="text-align:center; color:var(--text-muted); padding:20px;">Scanning network...</p>
                </div>
            </div>
        `;
        const fetchRadarData = async () => {
            try {
                const res = await fetch('/api/admin/radar'); const data = await res.json();
                const container = document.getElementById('radar-table-container'); if (!container) return; 
                if (data.success && data.users.length > 0) {
                    let tableHTML = `<div class="radar-table-wrapper"><table class="radar-table"><thead><tr><th>Identity (Phone)</th><th>Name</th><th>Active Module</th><th>Status</th></tr></thead><tbody>`;
                    data.users.forEach(user => { 
                        tableHTML += `
                            <tr>
                                <td style="font-family:monospace; font-weight:bold;">${user.mobile}</td>
                                <td>${user.name}</td>
                                <td><span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:0.8rem;">${user.module}</span></td>
                                <td><span style="color:var(--green); font-size:0.85rem; font-weight:bold;"><span class="live-dot"></span> Online</span></td>
                            </tr>
                        `; 
                    });
                    tableHTML += `</tbody></table></div>`; container.innerHTML = tableHTML;
                } else { container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:30px;">No active users found.</p>`; }
            } catch (e) {}
        };
        fetchRadarData(); activeRadarInterval = setInterval(fetchRadarData, 3000);
    } 
    else if (pluginId === 'plugin-deploy') {
        const sysState = await fetchSystemState();
        const currentVer = sysState ? sysState.version : '1.0.0';
        const shadowVer = '1.5.0-beta';
        contentArea.style.padding = '20px';
        
        contentArea.innerHTML = `
            <div style="background:#fff; border:1px solid #e2e8f0; padding:20px; border-radius:10px; max-width:800px; margin:0 auto; box-shadow: var(--shadow);">
                <h3 style="margin-top:0; color:var(--text-dark); border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Deployment Branches</h3>
                
                <div style="display:flex; justify-content:space-between; margin-bottom:15px; padding:15px; background:#f4f7f6; border-radius:8px; border-left:4px solid var(--green);">
                    <div><strong>Live Production</strong><br><span style="font-size:0.85rem; color:var(--text-muted);">Currently visible to users.</span></div>
                    <div style="font-weight:bold; color:var(--green); font-size:1.2rem;" id="ui-live-version">v${currentVer}</div>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-bottom:25px; padding:15px; background:#fffbeb; border-radius:8px; border-left:4px solid var(--saffron);">
                    <div><strong>Shadow Environment</strong><br><span style="font-size:0.85rem; color:var(--text-muted);">Active workspace.</span></div>
                    <div style="font-weight:bold; color:#d97706; font-size:1.2rem;">v${shadowVer}</div>
                </div>
                
                <button onclick="publishNewVersion('${shadowVer}')" style="background:var(--saffron); color:white; border:none; padding:12px 24px; border-radius:6px; font-weight:bold; cursor:pointer; width:100%; font-size:1rem;">🚀 Publish Shadow to Production</button>
                
                <h3 style="margin-top:40px; color:var(--text-dark); border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Module Publisher</h3>
                
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #f1f5f9;">
                    <div><div style="font-weight:bold;">🌾 Farmer Brain</div><div style="font-size:0.8rem; color:var(--text-muted);">Intelligent agriculture.</div></div>
                    <button class="toggle-btn ${sysState && sysState.modules.farmer === 'Active' ? 'active' : ''}" onclick="toggleModule('farmer', this)">${sysState && sysState.modules.farmer === 'Active' ? 'Active' : 'Coming Soon'}</button>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0;">
                    <div><div style="font-weight:bold;">📒 DigiLedger</div><div style="font-size:0.8rem; color:var(--text-muted);">Secure financial tracking.</div></div>
                    <button class="toggle-btn ${sysState && sysState.modules.ledger === 'Active' ? 'active' : ''}" onclick="toggleModule('ledger', this)">${sysState && sysState.modules.ledger === 'Active' ? 'Active' : 'Coming Soon'}</button>
                </div>
            </div>
        `;
    } 
    else {
        contentArea.style.padding = '20px';
        contentArea.innerHTML = `<div class="placeholder-box" style="border-color: var(--saffron);"><h3 style="color: var(--saffron); margin-top:0;">Loading...</h3></div>`;
    }
}

async function publishNewVersion(ver) {
    if(confirm('Push this update to all live users?')) {
        const res = await fetch('/api/admin/publish-version', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newVersion: ver }) });
        const data = await res.json();
        if(data.success) { document.getElementById('ui-live-version').innerText = 'v' + data.version; alert('Success! Apps will refresh automatically.'); }
    }
}

async function toggleModule(moduleId, btnElement) {
    const currentStatus = btnElement.innerText === 'Active' ? 'Coming Soon' : 'Active';
    const res = await fetch('/api/admin/toggle-module', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: moduleId, status: currentStatus }) });
    const data = await res.json();
    if(data.success) {
        if(currentStatus === 'Active') { btnElement.innerText = 'Active'; btnElement.classList.add('active'); } 
        else { btnElement.innerText = 'Coming Soon'; btnElement.classList.remove('active'); }
    }
}

function closePanel() {
    if (activeRadarInterval) { clearInterval(activeRadarInterval); activeRadarInterval = null; }
    document.getElementById('detail-panel').style.display = 'none';
    document.getElementById('main-dashboard').style.display = 'block';
    document.getElementById('panel-content-area').innerHTML = ''; 
}

