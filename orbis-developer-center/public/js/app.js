document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const workspace = document.querySelector('.workspace');
    
    const scanBtn = document.querySelector('.btn-primary');
    if (scanBtn) scanBtn.addEventListener('click', () => runFullScan(workspace));

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const targetText = item.innerText.trim();
            document.querySelector('.breadcrumb .highlight').innerText = targetText;

            if (targetText.includes('Project Inventory')) {
                await loadInventory(workspace);
            } else if (targetText.includes('Root Cause Engine')) {
                loadRootCauseEngine(workspace); // 🟢 NEW: Root Cause Engine Load
            } else if (targetText.includes('System Overview')) {
                loadSystemOverview(workspace);
            } else {
                workspace.innerHTML = `<div class="welcome-screen"><h2 style="color: #ef4444;">MODULE STANDBY</h2></div>`;
            }
        });
    });
});

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
            ${contentHTML}
        </div>
    `;
    modal.style.display = 'block';
}

window.closeModal = function() {
    const modal = document.getElementById('orbis-full-modal');
    if (modal) modal.style.display = 'none';
};

// ==========================================
// 📦 PROJECT INVENTORY
// ==========================================
const createListHTML = (listId, fileArray) => {
    const listItems = fileArray.map(f => `
        <li style="padding: 6px 0; border-bottom: 1px dashed #3f3f46; display: flex; justify-content: space-between; align-items: center;">
            <span style="word-wrap: break-word; flex: 1;">📄 ${f}</span>
            <span onclick="copyToClipboard('${f}', this)" style="cursor: pointer; background: var(--bg-dark); padding: 3px 6px; border-radius: 4px; font-size: 14px; margin-left: 10px;" title="Copy File Path">📋</span>
        </li>
    `).join('');
    
    // 🟢 Bulk Copy for Inventory
    const allFilesStr = fileArray.join('\\n');
    const safeData = btoa(unescape(encodeURIComponent(allFilesStr)));

    return `
    <div id="${listId}" style="display: none; margin-top: 15px; background: #000; padding: 10px; border: 1px solid var(--border); border-radius: 4px; max-height: 200px; overflow-y: auto;" onclick="event.stopPropagation()">
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

async function loadInventory(workspace) {
    workspace.innerHTML = `<div class="terminal-box" style="border-color: var(--accent);"><div class="term-body">&gt; Initializing File Scanner...<span class="cursor">_</span></div></div>`;
    try {
        const response = await fetch('/developer-center/api/inventory');
        const result = await response.json();
        if (result.status === 'SUCCESS') {
            const data = result.data;
            setTimeout(() => {
                workspace.innerHTML = `
                <h2 style="color: var(--accent); margin-bottom: 20px; font-family: var(--font-code);">📦 Project Inventory Scanned</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    <div onclick="toggleList('js-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">JAVASCRIPT (.js)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #f7df1e;">${data.jsFilesCount}</p>
                        ${createListHTML('js-list', data.jsList)}
                    </div>
                    <div onclick="toggleList('html-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">HTML (.html)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #e34f26;">${data.htmlFilesCount}</p>
                        ${createListHTML('html-list', data.htmlList)}
                    </div>
                </div>`;
            }, 500);
        }
    } catch (error) {
        workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; ERROR API</div></div>`;
    }
}

// ==========================================
// 🚀 RUN FULL SCAN (GROUPED BY FILE)
// ==========================================
async function runFullScan(workspace) {
    workspace.innerHTML = `
    <div class="terminal-box" style="border-color: #f7df1e;">
        <div class="term-body" style="color: #f7df1e;">
            &gt; Connecting to Sonar-style core...<br>
            &gt; Generating Filtered Report...<br>
            <span class="cursor">_</span>
        </div>
    </div>`;

    try {
        const response = await fetch('/developer-center/api/audit');
        const result = await response.json();
        
        if (result.status === 'SUCCESS') {
            const d = result.data;
            const gateColor = d.qualityGate === 'PASSED' ? 'var(--accent)' : '#ef4444';
            const secColor = d.securityGrade === 'A' ? 'var(--accent)' : (d.securityGrade === 'B' ? '#f7df1e' : '#ef4444');

            // 🟢 FIX: Group Issues by File Name
            const buildGroupedList = (issues, color, typeLabel) => {
                if (issues.length === 0) return '';
                
                const grouped = issues.reduce((acc, i) => {
                    if (!acc[i.file]) acc[i.file] = [];
                    acc[i.file].push(i);
                    return acc;
                }, {});

                return Object.keys(grouped).map(fileName => {
                    const fileIssues = grouped[fileName];
                    
                    // Bulk Copy Data Preparation
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
                                📋 Copy All for this File
                            </button>
                        </div>
                        ${issuesHtml}
                    </div>
                    `;
                }).join('');
            };

            const fullScreenHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h2 style="color: white; font-family: var(--font-code); font-size: 24px;">🛡️ Deep Code Audit Report</h2>
                    <div style="background: ${gateColor}; color: #000; padding: 8px 20px; font-weight: bold; border-radius: 20px; font-size: 14px;">QUALITY GATE: ${d.qualityGate}</div>
                </div>
                
                <h3 style="color: #ef4444; font-size: 20px; margin-top: 30px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">🚨 Security Risks (${d.totalVulnerabilities})</h3>
                ${d.totalVulnerabilities > 0 ? buildGroupedList(d.details.vulnerabilities, '#ef4444', 'Risks') : '<p style="color: var(--text-muted); padding: 10px 0;">No security vulnerabilities found.</p>'}

                <h3 style="color: #f7df1e; font-size: 20px; margin-top: 40px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">⚠️ Bugs & Tasks (${d.totalBugs})</h3>
                ${d.totalBugs > 0 ? buildGroupedList(d.details.bugs, '#f7df1e', 'Bugs') : '<p style="color: var(--text-muted); padding: 10px 0;">No major bugs found.</p>'}
            `;

            setTimeout(() => {
                workspace.innerHTML = `<div class="terminal-box" style="border-color: var(--accent);"><div class="term-body" style="color: var(--accent);">&gt; Report Generated. Opening Full Screen...</div></div>`;
                openFullScreenModal(fullScreenHTML);
            }, 800);
        }
    } catch (error) {
        workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; AUDIT ENGINE ERROR</div></div>`;
    }
}

// ==========================================
// 🎙️ ROOT CAUSE ENGINE (Voice & Text UI)
// ==========================================
function loadRootCauseEngine(workspace) {
    workspace.innerHTML = `
    <h2 style="color: var(--accent); margin-bottom: 20px; font-family: var(--font-code);">🔍 Root Cause Engine</h2>
    <div style="background: var(--bg-panel); padding: 25px; border: 1px solid var(--border); border-radius: 8px;">
        <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 14px;">Describe the issue via text or voice. The system will reverse-engineer the project to find the broken logic.</p>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="rca-query" placeholder="e.g., 'লটারি মডিউলে লাইন ব্রেক হচ্ছে...'" style="flex: 1; min-width: 200px; padding: 15px; background: #000; border: 1px solid var(--border); color: white; border-radius: 6px; font-family: var(--font-ui); font-size: 14px;">
            
            <button id="mic-btn" onclick="startVoiceInput()" style="background: #ef4444; border: none; padding: 0 20px; border-radius: 6px; cursor: pointer; font-size: 20px; transition: 0.3s;" title="Voice Input">🎤</button>
            
            <button onclick="runRCA()" style="background: var(--accent); border: none; padding: 0 25px; border-radius: 6px; cursor: pointer; font-weight: bold; color: black; font-family: var(--font-code);">⚡ Analyze Code</button>
        </div>
    </div>
    <div id="rca-results" style="margin-top: 30px;"></div>
    `;
}

// Voice Recognition Setup (Web Speech API)
window.startVoiceInput = function() {
    const micBtn = document.getElementById('mic-btn');
    const inputField = document.getElementById('rca-query');
    
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support Voice Input. Please type your query.");
        return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'bn-IN'; // ডিফল্ট বাংলা, তবে সব ভাষা ধরবে
    
    recognition.onstart = function() {
        micBtn.style.background = '#00ff66';
        micBtn.innerHTML = '🎙️';
        inputField.placeholder = "Listening...";
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        inputField.value = transcript;
    };
    
    recognition.onend = function() {
        micBtn.style.background = '#ef4444';
        micBtn.innerHTML = '🎤';
        inputField.placeholder = "e.g., 'লটারি মডিউলে লাইন ব্রেক হচ্ছে...'";
    };
    
    recognition.start();
};

window.runRCA = function() {
    const query = document.getElementById('rca-query').value;
    const resultsDiv = document.getElementById('rca-results');
    if (!query) {
        resultsDiv.innerHTML = `<span style="color:#ef4444;">Please enter a description or use voice input.</span>`;
        return;
    }
    
    // UI Loading State (Next step e Backend banabo er jnno)
    resultsDiv.innerHTML = `
    <div class="terminal-box" style="border-color: #f7df1e;">
        <div class="term-header">RCA Tracer Active</div>
        <div class="term-body" style="color: #f7df1e;">
            &gt; Processing NLP Input: "${query}"<br>
            &gt; Mapping to internal architecture...<br>
            &gt; Connecting to Backend Server (Awaiting Lego Block)...<br>
            <span class="cursor">_</span>
        </div>
    </div>`;
};

function loadSystemOverview(workspace) {
    workspace.innerHTML = `<div class="welcome-screen"><h2 class="glitch">SYSTEM ONLINE</h2><p>Lego Architecture Active. Explore the menu to scan or reverse-engineer your project.</p></div>`;
}
