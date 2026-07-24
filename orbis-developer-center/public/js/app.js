document.addEventListener('DOMContentLoaded', () => {
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

            if (targetText.includes('Inventory')) {
                await loadInventory();
            } else if (targetText.includes('Root Cause')) {
                loadRootCauseEngine(workspace);
            } else {
                workspace.innerHTML = `<div style="text-align:center; margin-top:50px;"><h2 style="color:var(--text-main);">System Online</h2><p style="color:var(--text-muted); margin-top:10px;">Select an option from the menu.</p></div>`;
            }
        });
    });
});

window.copyToClipboard = function(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = element.innerHTML;
        element.innerHTML = '✅ Copied!';
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
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-body); z-index: 9999; overflow-y: auto; display: none; padding: 20px; box-sizing: border-box;';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto; padding-bottom: 50px;">
            <button onclick="closeModal()" style="background: var(--bg-panel); color: var(--text-main); border: 1px solid var(--border); padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; font-weight: bold; display: flex; align-items: center; gap: 8px; box-shadow: var(--shadow-soft);">
                ⬅ Back
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
            <h2 style="color: var(--text-main); font-weight: 600; margin-top: 20px;">${title}</h2>
            <p style="color: var(--text-muted); margin-top: 10px;">Please wait while scanning...</p>
        </div>
    `);
};

// ==========================================
// 📦 PROJECT INVENTORY (Light Theme Cards)
// ==========================================
async function loadInventory() {
    showLoadingScreen("Scanning Inventory");
    try {
        const response = await fetch('/developer-center/api/inventory');
        const result = await response.json();
        
        if (result.status === 'SUCCESS') {
            const data = result.data;
            const contentHTML = `
                <h2 style="color: var(--text-main); margin-bottom: 25px; font-weight: 700;">📦 Project Inventory</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    
                    <div style="background: var(--bg-panel); padding: 25px; border-radius: var(--radius); box-shadow: var(--shadow-soft); border-top: 5px solid var(--color-yellow); text-align: center;">
                        <div style="font-size: 30px; margin-bottom: 10px;">🟨</div>
                        <h3 style="color: var(--text-muted); font-size: 14px; font-weight: 600;">JAVASCRIPT (.js)</h3>
                        <p style="font-size: 32px; font-weight: 700; margin-top: 5px; color: var(--text-main);">${data.jsFilesCount}</p>
                    </div>
                    
                    <div style="background: var(--bg-panel); padding: 25px; border-radius: var(--radius); box-shadow: var(--shadow-soft); border-top: 5px solid var(--color-red); text-align: center;">
                        <div style="font-size: 30px; margin-bottom: 10px;">🟥</div>
                        <h3 style="color: var(--text-muted); font-size: 14px; font-weight: 600;">HTML (.html)</h3>
                        <p style="font-size: 32px; font-weight: 700; margin-top: 5px; color: var(--text-main);">${data.htmlFilesCount}</p>
                    </div>
                    
                    <div style="background: var(--bg-panel); padding: 25px; border-radius: var(--radius); box-shadow: var(--shadow-soft); border-top: 5px solid var(--color-blue); text-align: center;">
                        <div style="font-size: 30px; margin-bottom: 10px;">🟦</div>
                        <h3 style="color: var(--text-muted); font-size: 14px; font-weight: 600;">CSS (.css)</h3>
                        <p style="font-size: 32px; font-weight: 700; margin-top: 5px; color: var(--text-main);">${data.cssFilesCount}</p>
                    </div>

                </div>`;
            document.getElementById('modal-content-area').innerHTML = contentHTML;
        }
    } catch (error) {
        document.getElementById('modal-content-area').innerHTML = `<h3 style="color:red; text-align:center;">API ERROR</h3>`;
    }
}

// ==========================================
// 🚀 RUN FULL SCAN (Interactive Light Cards)
// ==========================================
window.globalAuditData = null; 

async function runFullScan() {
    showLoadingScreen("Running Full Deep Scan");
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

window.renderAuditDashboard = function(activeCategory = 'vulnerabilities') {
    const d = window.globalAuditData;
    if(!d) return;

    const issuesToRender = activeCategory === 'vulnerabilities' ? d.details.vulnerabilities : (activeCategory === 'bugs' ? d.details.bugs : (d.details.codeSmells || []));
    const listColor = activeCategory === 'vulnerabilities' ? 'var(--color-red)' : (activeCategory === 'bugs' ? 'var(--color-yellow)' : 'var(--color-blue)');
    const listTitle = activeCategory === 'vulnerabilities' ? 'Security Risks' : (activeCategory === 'bugs' ? 'Bugs & Tasks' : 'Code Smells');

    const fullScreenHTML = `
        <h2 style="color: var(--text-main); margin-bottom: 25px; font-weight: 700;">🛡️ Deep Audit Report</h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <div onclick="renderAuditDashboard('vulnerabilities')" style="background: var(--bg-panel); padding: 25px; border-radius: var(--radius); box-shadow: var(--shadow-soft); border-top: 5px solid var(--color-red); text-align: center; cursor: pointer; border-bottom: ${activeCategory === 'vulnerabilities' ? '3px solid var(--color-red)' : 'none'};">
                <div style="font-size: 28px; margin-bottom: 10px;">🚨</div>
                <div style="color: var(--text-muted); font-size: 13px; font-weight: 600;">SECURITY RISKS</div>
                <div style="font-size: 36px; font-weight: 700; color: var(--color-red); margin-top: 5px;">${d.totalVulnerabilities}</div>
            </div>
            
            <div onclick="renderAuditDashboard('bugs')" style="background: var(--bg-panel); padding: 25px; border-radius: var(--radius); box-shadow: var(--shadow-soft); border-top: 5px solid var(--color-yellow); text-align: center; cursor: pointer; border-bottom: ${activeCategory === 'bugs' ? '3px solid var(--color-yellow)' : 'none'};">
                <div style="font-size: 28px; margin-bottom: 10px;">⚠️</div>
                <div style="color: var(--text-muted); font-size: 13px; font-weight: 600;">BUGS & TODOs</div>
                <div style="font-size: 36px; font-weight: 700; color: var(--color-yellow); margin-top: 5px;">${d.totalBugs}</div>
            </div>

            <div style="background: var(--bg-panel); padding: 25px; border-radius: var(--radius); box-shadow: var(--shadow-soft); border-top: 5px solid var(--color-blue); text-align: center;">
                <div style="font-size: 28px; margin-bottom: 10px;">♻️</div>
                <div style="color: var(--text-muted); font-size: 13px; font-weight: 600;">DUPLICATIONS</div>
                <div style="font-size: 36px; font-weight: 700; color: var(--color-blue); margin-top: 5px;">${d.duplicationPercentage}%</div>
            </div>
        </div>

        <h3 style="color: var(--text-main); font-size: 20px; margin-top: 30px; margin-bottom: 15px; font-weight: 700;">
            ${listTitle} Details
        </h3>
        
        <div id="audit-list-container">
            ${buildSortedGroupedList(issuesToRender, listColor, listTitle)}
        </div>
    `;

    document.getElementById('modal-content-area').innerHTML = fullScreenHTML;
};

const buildSortedGroupedList = (issues, color, typeLabel) => {
    if (issues.length === 0) return `<div style="background: var(--bg-panel); padding: 20px; border-radius: var(--radius); box-shadow: var(--shadow-soft); text-align: center; color: var(--color-green); font-weight: 600;">🎉 No issues found in this category!</div>`;
    
    const grouped = issues.reduce((acc, i) => {
        if (!acc[i.file]) acc[i.file] = [];
        acc[i.file].push(i); return acc;
    }, {});

    const sortedFiles = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

    return sortedFiles.map(([fileName, fileIssues]) => {
        const plainTextReport = fileIssues.map(i => `Line ${i.line}: ${i.issue}\nCode: ${i.code}`).join('\n\n');
        const copyText = `File: ${fileName}\n\n${plainTextReport}`;
        const safeData = btoa(unescape(encodeURIComponent(copyText)));
        
        const issuesHtml = fileIssues.map(i => `
            <div style="margin-top: 12px; padding: 15px; background: #f8fafc; border-left: 4px solid ${color}; border-radius: 8px;">
                <div style="color: var(--text-main); font-size: 14px; font-weight: 700; margin-bottom: 8px;">Line ${i.line} | ${i.issue}</div>
                <div style="font-family: var(--font-code); font-size: 13px; color: #475569; background: #e2e8f0; padding: 10px; border-radius: 6px; word-wrap: break-word; overflow-x: auto;">${i.code.replace(/</g, '&lt;')}</div>
            </div>
        `).join('');

        return `
        <div style="background: var(--bg-panel); padding: 20px; margin-bottom: 20px; border-radius: var(--radius); box-shadow: var(--shadow-soft);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                <div style="color: var(--text-main); font-weight: 700; font-size: 16px; word-break: break-all;">
                    📁 ${fileName} 
                    <span style="background: #f1f5f9; color: var(--text-main); padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-left: 10px; border: 1px solid var(--border);">${fileIssues.length} ${typeLabel}</span>
                </div>
                <button onclick="copyAuditData('${safeData}', this)" style="background: #f8fafc; border: 1px solid var(--border); color: var(--text-main); padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    📋 Copy All
                </button>
            </div>
            ${issuesHtml}
        </div>
        `;
    }).join('');
};

// ==========================================
// 🎙️ ROOT CAUSE ENGINE (Fixed Voice API & UI)
// ==========================================
function loadRootCauseEngine(workspace) {
    workspace.innerHTML = `
    <h2 style="color: var(--text-main); margin-bottom: 20px; font-weight: 700;">🔍 Root Cause Engine</h2>
    <div style="background: var(--bg-panel); padding: 30px; border-radius: var(--radius); box-shadow: var(--shadow-soft);">
        <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 15px;">Describe the issue via text or voice to reverse-engineer broken logic.</p>
        
        <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: stretch;">
            <div style="flex: 1; min-width: 200px; display: flex; background: #f1f5f9; border-radius: 12px; border: 1px solid var(--border); overflow: hidden;">
                <button id="mic-btn" onclick="startVoiceInput()" style="background: transparent; border: none; padding: 0 15px; cursor: pointer; font-size: 20px; transition: 0.3s; border-right: 1px solid var(--border);" title="Voice Input">🎤</button>
                <input type="text" id="rca-query" placeholder="e.g., 'লটারি মডিউলে লাইন ব্রেক হচ্ছে...'" style="flex: 1; padding: 15px; background: transparent; border: none; color: var(--text-main); font-family: var(--font-ui); font-size: 15px; outline: none;">
            </div>
            
            <button onclick="runRCA()" style="background: var(--color-blue); border: none; padding: 0 30px; border-radius: 12px; cursor: pointer; font-weight: 600; color: white; font-size: 15px; box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);">⚡ Search Code</button>
        </div>
    </div>
    `;
}

// 🟢 FIX: Cross-browser Speech Recognition
window.startVoiceInput = function() {
    const micBtn = document.getElementById('mic-btn');
    const inputField = document.getElementById('rca-query');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("Your browser does not support Voice Input natively. Please type the query.");
        return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-IN'; 
    
    recognition.onstart = function() { 
        micBtn.style.background = '#dcfce7'; 
        micBtn.innerHTML = '🎙️'; 
        inputField.placeholder = "Listening to your voice...";
    };
    
    recognition.onresult = function(event) { 
        inputField.value = event.results[0][0].transcript; 
    };
    
    recognition.onend = function() { 
        micBtn.style.background = 'transparent'; 
        micBtn.innerHTML = '🎤'; 
        inputField.placeholder = "e.g., 'লটারি মডিউলে লাইন ব্রেক হচ্ছে...'";
    };
    
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
                document.getElementById('modal-content-area').innerHTML = `
                <div style="background: var(--bg-panel); padding: 30px; border-radius: var(--radius); box-shadow: var(--shadow-soft); text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 15px;">✅</div>
                    <h3 style="color: var(--color-green);">System Healthy</h3>
                    <p style="color: var(--text-muted); margin-top: 10px;">No exact logic breaks found for "${query}".</p>
                </div>`;
                return;
            }

            const grouped = findings.reduce((acc, i) => {
                if (!acc[i.file]) acc[i.file] = [];
                acc[i.file].push(i); return acc;
            }, {});
            
            const sortedFiles = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);

            const resultsHTML = sortedFiles.map(([fileName, fileIssues]) => {
                const copyText = `Query: ${query}\nFile: ${fileName}\n\n` + fileIssues.map(i => `Line ${i.line}:\n${i.code}`).join('\n\n');
                const safeData = btoa(unescape(encodeURIComponent(copyText)));
                
                const linesHtml = fileIssues.map(i => `
                    <div style="margin-top: 12px; padding: 15px; background: #f8fafc; border-left: 4px solid var(--color-blue); border-radius: 8px;">
                        <div style="color: var(--text-main); font-size: 13px; font-weight: 700; margin-bottom: 5px;">Line ${i.line}</div>
                        <div style="font-family: var(--font-code); font-size: 13px; color: #475569; background: #e2e8f0; padding: 10px; border-radius: 6px; word-wrap: break-word; overflow-x: auto;">${i.code.replace(/</g, '&lt;')}</div>
                    </div>
                `).join('');

                return `
                <div style="background: var(--bg-panel); padding: 20px; margin-bottom: 20px; border-radius: var(--radius); box-shadow: var(--shadow-soft);">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <div style="color: var(--text-main); font-weight: 700; font-size: 16px; word-break: break-all;">
                            📁 ${fileName} 
                            <span style="background: #eff6ff; color: var(--color-blue); padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-left: 10px; font-weight: 600;">${fileIssues.length} Matches</span>
                        </div>
                        <button onclick="copyAuditData('${safeData}', this)" style="background: #f8fafc; border: 1px solid var(--border); color: var(--text-main); padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">📋 Copy Logic</button>
                    </div>
                    ${linesHtml}
                </div>`;
            }).join('');

            document.getElementById('modal-content-area').innerHTML = `
                <h2 style="color: var(--text-main); margin-bottom: 25px; font-weight: 700;">🔍 Traced Logic for: <span style="color: var(--color-blue);">"${query}"</span></h2>
                ${resultsHTML}
            `;
        }
    } catch (error) {
        document.getElementById('modal-content-area').innerHTML = `<h3 style="color:red; text-align:center;">SERVER ERROR</h3>`;
    }
};
