document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const workspace = document.querySelector('.workspace');
    
    // Top Bar-এর 'Run Full Scan' বাটন কানেক্ট করা
    const scanBtn = document.querySelector('.btn-primary');
    if (scanBtn) {
        scanBtn.addEventListener('click', () => runFullScan(workspace));
    }

    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const targetText = item.innerText.trim();
            document.querySelector('.breadcrumb .highlight').innerText = targetText;

            if (targetText.includes('Project Inventory')) {
                await loadInventory(workspace);
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
        element.innerHTML = '✅ Copied!';
        setTimeout(() => { element.innerHTML = originalHTML; }, 1500);
    });
};

// 🟢 NEW: ফুল স্ক্রিন ওপেন এবং ক্লোজ করার সিস্টেম
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

const createListHTML = (listId, fileArray) => {
    const listItems = fileArray.map(f => `
        <li style="padding: 6px 0; border-bottom: 1px dashed #3f3f46; display: flex; justify-content: space-between; align-items: center;">
            <span style="word-wrap: break-word; flex: 1;">📄 ${f}</span>
            <span onclick="copyToClipboard('${f}', this)" style="cursor: pointer; background: var(--bg-dark); padding: 3px 6px; border-radius: 4px; font-size: 14px; margin-left: 10px;" title="Copy File Path">📋</span>
        </li>
    `).join('');
    
    return `
    <div id="${listId}" style="display: none; margin-top: 15px; background: #000; padding: 10px; border: 1px solid var(--border); border-radius: 4px; max-height: 200px; overflow-y: auto;" onclick="event.stopPropagation()">
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
                    <div onclick="toggleList('css-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">CSS (.css)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #1572b6;">${data.cssFilesCount}</p>
                        ${createListHTML('css-list', data.cssList)}
                    </div>
                </div>`;
            }, 500);
        }
    } catch (error) {
        workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; ERROR API</div></div>`;
    }
}

async function runFullScan(workspace) {
    // স্ক্রিনে একটু লোডিং দেখাই
    workspace.innerHTML = `
    <div class="terminal-box" style="border-color: #f7df1e;">
        <div class="term-header">Deep Audit Engine</div>
        <div class="term-body" style="color: #f7df1e;">
            &gt; Connecting to Sonar-style core...<br>
            &gt; Generating Full Screen Report...<br>
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

            // 🟢 FIX: ওভারফ্লো প্রব্লেম সলভ করা হয়েছে, কপি বাটন পজিশন ঠিক করা হয়েছে
            const buildIssueList = (issues, color) => issues.map(i => {
                const copyText = `File: ${i.file}\nLine: ${i.line}\nIssue: ${i.issue}\nCode:\n${i.code}`;
                const safeData = btoa(unescape(encodeURIComponent(copyText)));
                
                return `
                <div style="background: #000; padding: 15px; margin-top: 15px; border-left: 4px solid ${color}; border-radius: 6px; position: relative;">
                    
                    <button onclick="copyAuditData('${safeData}', this)" style="position: absolute; top: 15px; right: 15px; background: var(--bg-panel); border: 1px solid var(--border); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 12px;" title="Copy Full Issue Details">
                        📋 Copy
                    </button>
                    
                    <div style="padding-right: 90px;">
                        <div style="color: var(--text-muted); font-size: 13px; word-wrap: break-word;">📁 ${i.file} <span style="color:white;">(Line: ${i.line})</span></div>
                        <div style="color: ${color}; font-size: 16px; font-weight: bold; margin: 8px 0;">${i.issue}</div>
                    </div>
                    
                    <div style="background:#18181b; padding: 12px; font-size: 13px; border-radius:4px; font-family: var(--font-code); white-space: pre-wrap; word-wrap: break-word; border: 1px solid #27272a; color: #d4d4d8; margin-top: 10px; overflow-x: auto;">
                        ${i.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </div>
                </div>
            `}).join('');

            // Full Screen Modal-এর জন্য HTML তৈরি
            const fullScreenHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h2 style="color: white; font-family: var(--font-code); font-size: 24px;">🛡️ Deep Code Audit Report</h2>
                    <div style="background: ${gateColor}; color: #000; padding: 8px 20px; font-weight: bold; border-radius: 20px; font-size: 14px;">QUALITY GATE: ${d.qualityGate}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: var(--bg-panel); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 12px;">SECURITY RATING</div>
                        <div style="font-size: 40px; font-weight: bold; color: ${secColor}; margin-top: 10px;">${d.securityGrade}</div>
                    </div>
                    <div style="background: var(--bg-panel); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 12px;">BUGS</div>
                        <div style="font-size: 40px; font-weight: bold; color: #ef4444; margin-top: 10px;">${d.totalBugs}</div>
                    </div>
                    <div style="background: var(--bg-panel); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 12px;">CODE SMELLS</div>
                        <div style="font-size: 40px; font-weight: bold; color: #f7df1e; margin-top: 10px;">${d.totalCodeSmells}</div>
                    </div>
                    <div style="background: var(--bg-panel); padding: 20px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 12px;">DUPLICATIONS</div>
                        <div style="font-size: 40px; font-weight: bold; color: var(--text-main); margin-top: 10px;">${d.duplicationPercentage}%</div>
                    </div>
                </div>

                <h3 style="color: #ef4444; font-size: 20px; margin-top: 30px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">🚨 Security Risks (${d.totalVulnerabilities})</h3>
                ${d.totalVulnerabilities > 0 ? buildIssueList(d.details.vulnerabilities, '#ef4444') : '<p style="color: var(--text-muted); padding: 10px 0;">No security vulnerabilities found.</p>'}

                <h3 style="color: #f7df1e; font-size: 20px; margin-top: 40px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">⚠️ Bugs & Tasks (${d.totalBugs})</h3>
                ${d.totalBugs > 0 ? buildIssueList(d.details.bugs, '#f7df1e') : '<p style="color: var(--text-muted); padding: 10px 0;">No major bugs found.</p>'}
            `;

            setTimeout(() => {
                // মেইন স্ক্রিনে রেডি মেসেজ দিয়ে, ফুল স্ক্রিন ওপেন করে দেব
                workspace.innerHTML = `<div class="terminal-box" style="border-color: var(--accent);"><div class="term-body" style="color: var(--accent);">&gt; Report Generated. Opening Full Screen...</div></div>`;
                openFullScreenModal(fullScreenHTML);
            }, 800);
        }
    } catch (error) {
        workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; AUDIT ENGINE ERROR</div></div>`;
    }
}

function loadSystemOverview(workspace) {
    workspace.innerHTML = `<div class="welcome-screen"><h2 class="glitch">SYSTEM ONLINE</h2><p>Lego Architecture Active. Click 'Run Full Scan' at the top right to analyze your code.</p></div>`;
}
