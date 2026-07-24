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

// 🟢 NEW: Safe Copy for Audit Data (Base64 என்கোডিং দিয়ে তৈরি)
window.copyAuditData = function(base64Data, element) {
    const text = decodeURIComponent(escape(atob(base64Data)));
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = element.innerHTML;
        element.innerHTML = '✅ Copied!';
        setTimeout(() => { element.innerHTML = originalHTML; }, 1500);
    });
};

const createListHTML = (listId, fileArray) => {
    const listItems = fileArray.map(f => `
        <li style="padding: 6px 0; border-bottom: 1px dashed #3f3f46; display: flex; justify-content: space-between; align-items: center;">
            <span style="word-break: break-all;">📄 ${f}</span>
            <span onclick="copyToClipboard('${f}', this)" style="cursor: pointer; background: var(--bg-dark); padding: 3px 6px; border-radius: 4px; font-size: 14px;" title="Copy File Path">📋</span>
        </li>
    `).join('');
    
    return `
    <div id="${listId}" style="display: none; margin-top: 15px; background: #000; padding: 10px; border: 1px solid var(--border); border-radius: 4px; max-height: 150px; overflow-y: auto;" onclick="event.stopPropagation()">
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
    document.querySelector('.breadcrumb .highlight').innerText = "Full Project Audit";
    
    workspace.innerHTML = `
    <div class="terminal-box" style="border-color: #f7df1e;">
        <div class="term-header">Deep Audit Engine</div>
        <div class="term-body" style="color: #f7df1e;">
            &gt; Connecting to Sonar-style core...<br>
            &gt; Analyzing vulnerabilities, bugs, and code smells...<br>
            &gt; Processing abstract syntax trees...<br>
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

            // 🟢 FIX: Base64 encoding to prevent HTML breakage and word-break for UI overflow
            const buildIssueList = (issues, color) => issues.map(i => {
                const copyText = `File: ${i.file}\nLine: ${i.line}\nIssue: ${i.issue}\nCode:\n${i.code}`;
                const safeData = btoa(unescape(encodeURIComponent(copyText)));
                
                return `
                <div style="background: #000; padding: 12px; margin-top: 10px; border-left: 4px solid ${color}; border-radius: 6px; display:flex; justify-content: space-between; align-items:flex-start; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 0; padding-right: 10px;">
                        <div style="color: var(--text-muted); font-size: 11px; word-break: break-all;">📁 ${i.file} <span style="color:white;">(Line: ${i.line})</span></div>
                        <div style="color: ${color}; font-size: 14px; font-weight: bold; margin: 6px 0;">${i.issue}</div>
                        <div style="background:#18181b; padding: 8px; font-size: 12px; border-radius:4px; font-family: var(--font-code); white-space: pre-wrap; word-break: break-all; border: 1px solid #27272a; color: #d4d4d8;">
                            ${i.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                        </div>
                    </div>
                    <button onclick="copyAuditData('${safeData}', this)" style="background: var(--bg-panel); border: 1px solid var(--border); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 5px; flex-shrink: 0; margin-top: 5px;" title="Copy Full Issue Details">
                        📋 Copy Info
                    </button>
                </div>
            `}).join('');

            setTimeout(() => {
                workspace.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                    <h2 style="color: white; font-family: var(--font-code);">🛡️ Deep Code Audit Report</h2>
                    <div style="background: ${gateColor}; color: #000; padding: 5px 15px; font-weight: bold; border-radius: 20px; font-size: 12px;">QUALITY GATE: ${d.qualityGate}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div style="background: var(--bg-panel); padding: 15px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 11px;">SECURITY RATING</div>
                        <div style="font-size: 32px; font-weight: bold; color: ${secColor};">${d.securityGrade}</div>
                    </div>
                    <div style="background: var(--bg-panel); padding: 15px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 11px;">BUGS</div>
                        <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${d.totalBugs}</div>
                    </div>
                    <div style="background: var(--bg-panel); padding: 15px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 11px;">CODE SMELLS</div>
                        <div style="font-size: 32px; font-weight: bold; color: #f7df1e;">${d.totalCodeSmells}</div>
                    </div>
                    <div style="background: var(--bg-panel); padding: 15px; border-radius: 8px; text-align: center; border: 1px solid var(--border);">
                        <div style="color: var(--text-muted); font-size: 11px;">DUPLICATIONS</div>
                        <div style="font-size: 32px; font-weight: bold; color: var(--text-main);">${d.duplicationPercentage}%</div>
                    </div>
                </div>

                <h3 style="color: #ef4444; font-size: 16px; margin-top: 30px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">🚨 Security Risks (${d.totalVulnerabilities})</h3>
                ${d.totalVulnerabilities > 0 ? buildIssueList(d.details.vulnerabilities, '#ef4444') : '<p style="color: var(--text-muted); font-size: 12px; padding: 10px 0;">No security vulnerabilities found.</p>'}

                <h3 style="color: #f7df1e; font-size: 16px; margin-top: 30px; border-bottom: 1px solid var(--border); padding-bottom: 10px; font-family: var(--font-code);">⚠️ Bugs & Tasks (${d.totalBugs})</h3>
                ${d.totalBugs > 0 ? buildIssueList(d.details.bugs, '#f7df1e') : '<p style="color: var(--text-muted); font-size: 12px; padding: 10px 0;">No major bugs found.</p>'}
                `;
            }, 1200);
        }
    } catch (error) {
        workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; AUDIT ENGINE ERROR</div></div>`;
    }
}

function loadSystemOverview(workspace) {
    workspace.innerHTML = `<div class="welcome-screen"><h2 class="glitch">SYSTEM ONLINE</h2><p>Lego Architecture Active. Click 'Run Full Scan' at the top right to analyze your code.</p></div>`;
}
