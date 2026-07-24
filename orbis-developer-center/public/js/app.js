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

// 📋 গ্লোবাল কপি ফাংশন (যেকোনো ডেটা কপি করার জন্য)
window.copyToClipboard = function(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = element.innerHTML;
        element.innerHTML = '✅';
        setTimeout(() => { element.innerHTML = originalHTML; }, 1500);
    });
};

// হেল্পার ফাংশন (Copy আইকন সহ লিস্ট তৈরি করার জন্য)
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

// ==========================================
// 📦 PROJECT INVENTORY (With Copy Feature)
// ==========================================
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

// ==========================================
// 🚀 RUN FULL SCAN (SONARCLOUD STYLE)
// ==========================================
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

            // ইস্যু লিস্ট তৈরি করা (কপি বাটনসহ)
            const buildIssueList = (issues, color) => issues.map(i => `
                <div style="background: #000; padding: 10px; margin-top: 8px; border-left: 3px solid ${color}; border-radius: 4px; display:flex; justify-content: space-between; align-items:flex-start;">
                    <div>
                        <div style="color: var(--text-muted); font-size: 11px;">${i.file} (Line: ${i.line})</div>
                        <div style="color: ${color}; font-size: 13px; font-weight: bold; margin: 4px 0;">${i.issue}</div>
                        <div style="background:#18181b; padding: 5px; font-size: 11px; border-radius:4px; font-family: monospace;">${i.code.replace(/</g, '&lt;')}</div>
                    </div>
                    <span onclick="copyToClipboard('File: ${i.file}\\nLine: ${i.line}\\nIssue: ${i.issue}\\nCode: ${i.code.replace(/'/g, "\\'")}', this)" style="cursor: pointer; padding: 5px; font-size: 16px; margin-left: 10px;" title="Copy Details">📋</span>
                </div>
            `).join('');

            setTimeout(() => {
                workspace.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: white; font-family: var(--font-code);">🛡️ Deep Code Audit Report</h2>
                    <div style="background: ${gateColor}; color: #000; padding: 5px 15px; font-weight: bold; border-radius: 20px; font-size: 12px;">QUALITY GATE: ${d.qualityGate}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 25px;">
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

                <!-- Vulnerabilities / Security Risks -->
                <h3 style="color: #ef4444; font-size: 14px; margin-top: 20px; font-family: var(--font-code);">🚨 Security Risks (${d.totalVulnerabilities})</h3>
                ${d.totalVulnerabilities > 0 ? buildIssueList(d.details.vulnerabilities, '#ef4444') : '<p style="color: var(--text-muted); font-size: 12px;">No security vulnerabilities found.</p>'}

                <!-- Bugs / TODOs -->
                <h3 style="color: #f7df1e; font-size: 14px; margin-top: 20px; font-family: var(--font-code);">⚠️ Bugs & Tasks (${d.totalBugs})</h3>
                ${d.totalBugs > 0 ? buildIssueList(d.details.bugs, '#f7df1e') : '<p style="color: var(--text-muted); font-size: 12px;">No major bugs found.</p>'}
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
