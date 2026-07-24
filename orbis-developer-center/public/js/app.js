document.addEventListener('DOMContentLoaded', () => {
    // 🟢 ডাইনামিক অ্যানিমেশন স্টাইল অ্যাড করা হলো (স্ক্যানিং স্পিনার)
    const style = document.createElement('style');
    style.innerHTML = `
        .orbis-spinner { width: 50px; height: 50px; border: 4px solid var(--bg-panel); border-top: 4px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .audit-card { background: var(--bg-panel); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid var(--border); cursor: pointer; transition: 0.3s; }
        .audit-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .audit-card.active { border-color: var(--accent); background: #000; }
    `;
    document.head.appendChild(style);

    const navItems = document.querySelectorAll('.nav-item');
    const workspace = document.querySelector('.workspace');
    
    const scanBtn = document.querySelector('.btn-primary');
    if (scanBtn) scanBtn.addEventListener('click', runFullScan);

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const targetText = item.innerText.trim();
            document.querySelector('.breadcrumb .highlight').innerText = targetText;

            if (targetText.includes('Project Inventory')) {
                await loadInventory();
            } else if (targetText.includes('Root Cause Engine')) {
                loadRootCauseEngine(workspace);
            } else if (targetText.includes('System Overview')) {
                loadSystemOverview(workspace);
            } else {
                workspace.innerHTML = `<div class="welcome-screen"><h2 style="color: #ef4444;">MODULE STANDBY</h2></div>`;
            }
        });
    });
});

// ==========================================
// 📋 গ্লোবাল কপি ফাংশন
// ==========================================
window.copyToClipboard = function(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = element.innerHTML;
        element.innerHTML = '✅';
        setTimeout(() => { element.innerHTML = originalHTML; }, 1500);
    });
};

window.copyAuditData = function(base64Data, element) {
    const text = decodeURIComponent(escape(atob(base64Data)));
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = element.innerHTML;
        element.innerHTML = '✅ Copied All!';
        setTimeout(() => { element.innerHTML = originalHTML; }, 1500);
    });
};

// ==========================================
// 🪟 ফুল স্ক্রিন মডাল ইঞ্জিন
// ==========================================
function openFullScreenModal(contentHTML) {
    let modal = document.getElementById('orbis-full-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orbis-full-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-dark); z-index: 9999; overflow-y: auto; display: none; padding: 20px; box-sizing: border-box;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding-bottom: 50px;">
            <button onclick="closeModal()" style="background: var(--bg-panel); color: white; border: 1px solid var(--border); padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-bottom: 20px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                ⬅ Back to Dashboard
            </button>
            <div id="modal-content-area">${contentHTML}</div>
        </div>
    `;
    modal.style.display = 'block';
}

window.closeModal = function() {
    const modal = document.getElementById('orbis-full-modal');
    if (modal) modal.style.display = 'none';
};

window.showLoadingScreen = function(title) {
    openFullScreenModal(`
        <div style="text-align: center; margin-top: 100px;">
            <div class="orbis-spinner"></div>
            <h2 style="color: var(--accent); font-family: var(--font-code); margin-top: 20px;">${title}</h2>
            <p style="color: var(--text-muted); margin-top: 10px;">Extracting real-time system data...</p>
        </div>
    `);
};

// ==========================================
// 📦 PROJECT INVENTORY (Full Screen Mode)
// ==========================================
const createInventoryListHTML = (listId, fileArray) => {
    const listItems = fileArray.map(f => `
        <li style="padding: 6px 0; border-bottom: 1px dashed #3f3f46; display: flex; justify-content: space-between; align-items: center;">
            <span style="word-wrap: break-word; flex: 1;">📄 ${f}</span>
            <span onclick="copyToClipboard('${f}', this)" style="cursor: pointer; background: var(--bg-dark); padding: 3px 6px; border-radius: 4px; font-size: 14px; margin-left: 10px;" title="Copy File Path">📋</span>
        </li>
    `).join('');
    
    const allFilesStr = fileArray.join('\n');
    const safeData = btoa(unescape(encodeURIComponent(allFilesStr)));

    return `
    <div id="${listId}" style="display: none; margin-top: 15px; background: #000; padding: 10px; border: 1px solid var(--border); border-radius: 4px; max-height: 300px; overflow-y: auto;" onclick="event.stopPropagation()">
        <div style="text-align: right; margin-bottom: 10px;">
            <button onclick="copyAuditData('${safeData}', this)" style="background: var(--bg-panel); color: white; padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px; cursor: pointer; font-size: 11px;">📋 Copy All List</button>
        </div>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 12px; font-family: var(--font-code); color: var(--text-muted);">
            ${listItems || '<li>No files found.</li>'}
        </ul>
    </div>`;
};

window.toggleList = function(id) {
    const el = document.getElementById(id);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

async function loadInventory() {
    showLoadingScreen("Scanning File Directory");
    try {
        const response = await fetch('/developer-center/api/inventory');
        const result = await response.json();
        
        if (result.status === 'SUCCESS') {
            const data = result.data;
            const contentHTML = `
                <h2 style="color: var(--accent); margin-bottom: 20px; font-family: var(--font-code);">📦 Project Inventory</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    <div onclick="toggleList('js-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">JAVASCRIPT (.js)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #f7df1e;">${data.jsFilesCount}</p>
                        ${createInventoryListHTML('js-list', data.jsList)}
                    </div>
                    <div onclick="toggleList('html-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">HTML (.html)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #e34f26;">${data.htmlFilesCount}</p>
                        ${createInventoryListHTML('html-list', data.htmlList)}
                    </div>
                </div>`;
            document.getElementById('modal-content-area').innerHTML = contentHTML;
        }
    } catch (error) {
        document.getElementById('modal-content-area').innerHTML = `<h3 style="color:red; text-align:center;">API ERROR</h3>`;
    }
}

// ==========================================
// 🚀 RUN FULL SCAN (Interactive Top Cards & Sorter)
// ==========================================
window.globalAuditData = null; // ডেটা সেভ রাখার জন্য

async function runFullScan() {
    showLoadingScreen("Running Deep SonarCloud Scan");

    try {
        const response = await fetch('/developer-center/api/audit');
        const result = await response.json();
        
        if (result.status === 'SUCCESS') {
            window.globalAuditData = result.data;
            renderAuditDashboard();
        }
    } catch (error) {
        document.getElementById('modal-content-area').innerHTML = `<h3 style="color:red; text-align:center;">AUDIT ENGINE ERROR</h3>`;
    }
}

// 🟢 কার্ডের ড্যাশবোর্ড রেন্ডার
window.renderAuditDashboard = function(activeCategory = 'vulnerabilities') {
    const d = window.globalAuditData;
    if(!d) return;

    const gateColor = d.qualityGate === 'PASSED' ? 'var(--accent)' : '#ef4444';
    const secColor = d.securityGrade === 'A' ? 'var(--accent)' : (d.securityGrade === 'B' ? '#f7df1e' : '#ef4444');

    const issuesToRender = activeCategory === 'vulnerabilities' ? d.details.vulnerabilities : (activeCategory === 'bugs' ? d.details.bugs : (d.details.codeSmells || []));
    const listColor = activeCategory === 'vulnerabilities' ? '#ef4444' : (activeCategory === 'bugs' ? '#f7df1e' : '#1572b6');
    const listTitle = activeCategory === 'vulnerabilities' ? 'Security Risks' : (activeCategory === 'bugs' ? 'Bugs & Tasks' : 'Code Smells');

    const fullScreenHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
            <h2 style="color: white; font-family: var(--font-code); font-size: 24px;">🛡️ Deep Code Audit Report</h2>
            <div style="background: ${gateColor}; color: #000; padding: 8px 20px; font-weight: bold; border-radius: 20px; font-size: 14px;">QUALITY GATE: ${d.qualityGate}</div>
        </div>
        
        <!-- 🟢 Interactive Top Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
            <div class="audit-card ${activeCategory === 'vulnerabilities' ? 'active' : ''}" onclick="renderAuditDashboard('vulnerabilities')" style="border-color: ${activeCategory === 'vulnerabilities' ? '#ef4444' : 'var(--border)'}">
                <div style="color: var(--text-muted); font-size: 12px;">SECURITY RISKS</div>
                <div style="font-size: 32px; font-weight: bold; color: #ef4444; margin-top: 10px;">${d.totalVulnerabilities}</div>
            </div>
            <div class="audit-card ${activeCategory === 'bugs' ? 'active' : ''}" onclick="renderAuditDashboard('bugs')" style="border-color: ${activeCategory === 'bugs' ? '#f7df1e' : 'var(--border)'}">
                <div style="color: var(--text-muted); font-size: 12px;">BUGS & TODOs</div>
                <div style="font-size: 32px; font-weight: bold; color: #f7df1e; margin-top: 10px;">${d.totalBugs}</div>
            </div>
            <div class="audit-card">
                <div style="color: var(--text-muted); font-size: 12px;">DUPLICATIONS</div>
                <div style="font-size: 32px; font-weight: bold; color: var(--text-main); margin-top: 10px;">${d.duplicationPercentage}%</div>
            </div>
        </div>

        <h3 style="color: ${listColor}; font-size: 20px; margin-top: 30px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">
            ${listTitle} (${issuesToRender.length})
        </h3>
        
        <div id="audit-list-container" style="margin-top:20px;">
            ${buildSortedGroupedList(issuesToRender, listColor, listTitle)}
        </div>
    `;

    document.getElementById('modal-content-area').innerHTML = fullScreenHTML;
};

// 🟢 ফাইল অনুযায়ী গ্রুপ এবং সর্ট (বেশি এরর আগে)
const buildSortedGroupedList = (issues, color, typeLabel) => {
    if (issues.length === 0) return `<p style="color: var(--text-muted); padding: 10px 0;">No issues found in this category! 🎉</p>`;
    
    // Grouping
    const grouped = issues.reduce((acc, i) => {
        if (!acc[i.file]) acc[i.file] = [];
        acc[i.file].push(i);
        return acc;
    }, {});

    // 🟢 Sorting: যে ফাইলে বেশি এরর, সেটা আগে আসবে
    const sortedFiles = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

    return sortedFiles.map(([fileName, fileIssues]) => {
        const plainTextReport = fileIssues.map(i => `Line ${i.line}: ${i.issue}\nCode: ${i.code}`).join('\n\n');
        const copyText = `File: ${fileName}\n\n${plainTextReport}`;
        const safeData = btoa(unescape(encodeURIComponent(copyText)));
        
        const issuesHtml = fileIssues.map(i => `
            <div style="margin-top: 10px; padding: 12px; background: #18181b; border-left: 3px solid ${color}; border-radius: 4px;">
                <div style="color: ${color}; font-size: 14px; font-weight: bold; margin-bottom: 6px;">Line ${i.line} | ${i.issue}</div>
                <div style="font-family: var(--font-code); font-size: 12px; color: #d4d4d8; word-wrap: break-word; overflow-x: auto;">${i.code.replace(/</g, '&lt;')}</div>
            </div>
        `).join('');

        return `
        <div style="background: #000; padding: 15px; margin-top: 15px; border: 1px solid var(--border); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                <div style="color: white; font-weight: bold; word-break: break-all;">
                    📁 ${fileName} 
                    <span style="background: ${color}; color: #000; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 10px;">${fileIssues.length} ${typeLabel}</span>
                </div>
                <button onclick="copyAuditData('${safeData}', this)" style="background: var(--bg-panel); border: 1px solid var(--border); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    📋 Copy All from File
                </button>
            </div>
            ${issuesHtml}
        </div>
        `;
    }).join('');
};

// ==========================================
// 🎙️ ROOT CAUSE ENGINE
// ==========================================
function loadRootCauseEngine(workspace) {
    workspace.innerHTML = `
    <h2 style="color: var(--accent); margin-bottom: 20px; font-family: var(--font-code);">🔍 Root Cause Engine</h2>
    <div style="background: var(--bg-panel); padding: 25px; border: 1px solid var(--border); border-radius: 8px;">
        <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 14px;">Describe the issue via text or voice. The system will search real codebase to reverse-engineer the broken logic.</p>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="rca-query" placeholder="e.g., 'লটারি মডিউলে লাইন ব্রেক হচ্ছে...'" style="flex: 1; min-width: 200px; padding: 15px; background: #000; border: 1px solid var(--border); color: white; border-radius: 6px; font-family: var(--font-ui); font-size: 14px;">
            <button id="mic-btn" onclick="startVoiceInput()" style="background: #ef4444; border: none; padding: 0 20px; border-radius: 6px; cursor: pointer; font-size: 20px; transition: 0.3s;" title="Voice Input">🎤</button>
            <button onclick="runRCA()" style="background: var(--accent); border: none; padding: 0 25px; border-radius: 6px; cursor: pointer; font-weight: bold; color: black; font-family: var(--font-code);">⚡ Search Real Code</button>
        </div>
    </div>
    `;
}

window.startVoiceInput = function() {
    const micBtn = document.getElementById('mic-btn');
    const inputField = document.getElementById('rca-query');
    
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support Voice Input."); return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'bn-IN'; 
    recognition.onstart = function() { micBtn.style.background = '#00ff66'; micBtn.innerHTML = '🎙️'; };
    recognition.onresult = function(event) { inputField.value = event.results[0][0].transcript; };
    recognition.onend = function() { micBtn.style.background = '#ef4444'; micBtn.innerHTML = '🎤'; };
    recognition.start();
};

window.runRCA = async function() {
    const query = document.getElementById('rca-query').value;
    if (!query) return alert('Please enter a query first.');
    
    showLoadingScreen("Reverse Engineering Logic...");

    try {
        const response = await fetch('/developer-center/api/rca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const result = await response.json();

        if (result.status === 'SUCCESS') {
            const findings = result.data;
            if (findings.length === 0) {
                document.getElementById('modal-content-area').innerHTML = `<h3 style="color:var(--accent);">✅ No matching logic or errors found.</h3>`;
                return;
            }

            const grouped = findings.reduce((acc, i) => {
                if (!acc[i.file]) acc[i.file] = [];
                acc[i.file].push(i);
                return acc;
            }, {});
            
            // Sort by occurrences
            const sortedFiles = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

            const resultsHTML = sortedFiles.map(([fileName, fileIssues]) => {
                const copyText = `Query: ${query}\nFile: ${fileName}\n\n` + fileIssues.map(i => `Line ${i.line}:\n${i.code}`).join('\n\n');
                const safeData = btoa(unescape(encodeURIComponent(copyText)));
                
                const linesHtml = fileIssues.map(i => `
                    <div style="margin-top: 10px; padding: 10px; background: #000; border-left: 2px solid var(--accent); border-radius: 4px;">
                        <div style="color: var(--text-muted); font-size: 11px; margin-bottom: 5px;">Line ${i.line}</div>
                        <div style="font-family: var(--font-code); font-size: 12px; color: #d4d4d8; word-wrap: break-word; overflow-x: auto;">${i.code.replace(/</g, '&lt;')}</div>
                    </div>
                `).join('');

                return `
                <div style="background: var(--bg-panel); padding: 15px; margin-top: 15px; border: 1px solid var(--border); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                        <div style="color: white; font-weight: bold; word-break: break-all;">📁 ${fileName} <span style="background: var(--accent); color: #000; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${fileIssues.length} Matches</span></div>
                        <button onclick="copyAuditData('${safeData}', this)" style="background: #000; border: 1px solid var(--border); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">📋 Copy Logic</button>
                    </div>
                    ${linesHtml}
                </div>`;
            }).join('');

            document.getElementById('modal-content-area').innerHTML = `
                <h3 style="color: white; margin-bottom: 20px; font-family: var(--font-code); border-bottom: 1px solid var(--border); padding-bottom: 10px;">
                    🔍 Traced Logic for: <span style="color: var(--accent