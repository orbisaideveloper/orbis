let currentReportText = ""; 
let currentTraceData = [];
let currentLogs = {};
let activeLogType = 'all';

document.addEventListener('DOMContentLoaded', () => {
    runInitialScan();
    fetchLogs();
    setupVoiceRecognition(); 

    const searchBox = document.getElementById('search-input');
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(e.target.value.trim());
        }
    });
});

async function runInitialScan() {
    try {
        const response = await fetch('/api/diagnostics/health');
        const data = await response.json();
        
        const grid = document.getElementById('health-grid');
        grid.innerHTML = ''; 

        const createCard = (title, dataObj, customClass = '') => {
            let cClass = 'health-card ' + customClass;
            if (dataObj.status === 'FAIL') cClass += ' fail-card';
            if (dataObj.status === 'WARN') cClass += ' warn-card';
            
            const card = document.createElement('div');
            card.className = cClass.trim();
            card.onclick = () => openModal(title, dataObj.detail);
            
            const h3 = document.createElement('h3');
            h3.textContent = title;
            card.appendChild(h3);
            
            const valDiv = document.createElement('div');
            valDiv.className = 'value';
            
            const span = document.createElement('span');
            if (dataObj.status === 'FAIL') { span.style.color = 'var(--accent-red)'; }
            else if (dataObj.status === 'WARN') { span.style.color = 'var(--accent-warning)'; }
            else { span.style.color = 'var(--accent-green)'; }
            
            span.textContent = dataObj.value;
            valDiv.appendChild(span);
            card.appendChild(valDiv);
            
            return card;
        };

        grid.appendChild(createCard('Project Health', data.project, 'score-card'));
        grid.appendChild(createCard('Runtime Engine', data.runtime, ''));
        grid.appendChild(createCard('Pipeline & Build', data.pipeline, ''));
        grid.appendChild(createCard('Dependencies', data.dependency, ''));
        grid.appendChild(createCard('Modules', data.modules, ''));
        grid.appendChild(createCard('Code Quality', data.quality, ''));
        grid.appendChild(createCard('Security Check', data.security, ''));
        grid.appendChild(createCard('Git / Changes', data.git, ''));
        grid.appendChild(createCard('AI & Brain', data.brain, ''));
        grid.appendChild(createCard('System Load', data.systemLoad, ''));
        
    } catch (error) { 
        console.error("Health scan failed", error); 
    }
}

function openModal(title, detail) {
    document.getElementById('modal-title').innerText = title + ' Details';
    document.getElementById('modal-desc').innerText = detail;
    document.getElementById('infoModal').style.display = 'block';
}

function closeModal() { 
    document.getElementById('infoModal').style.display = 'none'; 
}

window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target === modal) {
        closeModal();
    }
}

function setupVoiceRecognition() {
    const micBtn = document.getElementById('mic-btn');
    const searchInput = document.getElementById('search-input');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; 
        recognition.interimResults = false;
        
        recognition.onstart = () => { 
            micBtn.classList.add('recording'); 
            searchInput.placeholder = "Listening intent..."; 
        };
        recognition.onspeechend = () => { 
            micBtn.classList.remove('recording'); 
            recognition.stop(); 
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            handleSearch(transcript); 
        };
        recognition.onerror = () => { 
            micBtn.classList.remove('recording'); 
        };
        micBtn.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        micBtn.style.display = 'none'; 
    }
}

async function fetchLogs() {
    try {
        const response = await fetch('/api/diagnostics/logs');
        currentLogs = await response.json();
        renderLogs();
    } catch (error) {
        document.getElementById('console-output').textContent = "Failed to connect to Multi-Log Server.";
    }
}

function switchLog(type, btnElement) {
    activeLogType = type;
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderLogs();
}

function renderLogs() {
    const consoleEl = document.getElementById('console-output');
    if (currentLogs[activeLogType]) {
        consoleEl.textContent = currentLogs[activeLogType];
    } else {
        consoleEl.textContent = "No logs found for this category.";
    }
    consoleEl.parentElement.scrollTop = consoleEl.parentElement.scrollHeight;
}

function createTextWithBreaks(elementId, linesArray) {
    const el = document.getElementById(elementId);
    el.innerHTML = '';
    linesArray.forEach((lineText, index) => {
        if (index !== 0) el.appendChild(document.createElement('br'));
        const span = document.createElement('span');
        span.textContent = lineText;
        el.appendChild(span);
    });
}

async function handleSearch(query) {
    const tableBody = document.getElementById('report-body');
    const treeBox = document.getElementById('tree-box');
    const treeOutput = document.getElementById('tree-output');
    const auditBox = document.getElementById('audit-box');

    auditBox.style.display = 'none';
    
    tableBody.innerHTML = '';
    const loadingTr = document.createElement('tr');
    const loadingTd = document.createElement('td');
    loadingTd.colSpan = 10;
    loadingTd.style.textAlign = 'center';
    loadingTd.style.color = 'var(--accent-warning)';
    loadingTd.textContent = `Engine Analyzing Intent: "${query}"...`;
    loadingTr.appendChild(loadingTd);
    tableBody.appendChild(loadingTr);
    
    try {
        const response = await fetch('/api/diagnostics/scan', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ query: query }) 
        });
        const data = await response.json();
        
        if (data.isAudit) {
            auditBox.style.display = 'block';
            const statusBadge = document.getElementById('safe-commit-status');
            statusBadge.className = `safe-commit-badge ${data.auditData.safeToCommit ? 'commit-yes' : 'commit-no'}`;
            statusBadge.textContent = `SAFE TO COMMIT : ${data.auditData.safeToCommit ? 'YES' : 'NO'}`;
            
            const scoresText = [
                'Scores:',
                `Architecture: ${data.auditData.scores.architecture}`,
                `Runtime: ${data.auditData.scores.runtime}`,
                `Code Quality: ${data.auditData.scores.quality}`,
                `Security: ${data.auditData.scores.security}`
            ];
            createTextWithBreaks('audit-scores', scoresText);
            
            const risksText = ['Top Risks:'];
            data.auditData.topRisks.forEach(r => risksText.push(`• ${r}`));
            createTextWithBreaks('audit-risks', risksText);
        }

        if (data.tree) { 
            treeBox.style.display = 'block'; 
            treeOutput.textContent = data.tree; 
        } else { 
            treeBox.style.display = 'none'; 
        }

        generateReport(data.issues || [], data.tree || "");
    } catch (error) {
        tableBody.innerHTML = '';
        const errTr = document.createElement('tr');
        const errTd = document.createElement('td');
        errTd.colSpan = 10;
        errTd.style.textAlign = 'center';
        errTd.style.color = 'var(--accent-red)';
        errTd.textContent = 'Root Cause Engine unreachable.';
        errTr.appendChild(errTd);
        tableBody.appendChild(errTr);
    }
}

function generateReport(issues, treeData) {
    const tableBody = document.getElementById('report-body');
    tableBody.innerHTML = ''; 
    currentTraceData = issues;
    
    currentReportText = "ORBIS V3 ROOT CAUSE EXPORT\n================================\n\n";
    if (treeData) {
        currentReportText += `[EXECUTION TREE]\n${treeData}\n\n`;
    }
    currentReportText += "[ROOT CAUSE TRACE]\n";

    issues.forEach(issue => {
        currentReportText += `Stage: ${issue.stage}\nStatus: ${issue.status}\nFile: ${issue.file}:${issue.line}\nFunction: ${issue.func}\nReason: ${issue.reason}\nImpact: ${issue.impact}\nDependency: ${issue.dependency}\nFix: ${issue.fix}\nConfidence: ${issue.confidence}\n----------------------------------\n`;

        const tr = document.createElement('tr');
        
        const addTd = (content, color, isBold) => {
            const td = document.createElement('td');
            const inner = document.createElement(isBold ? 'strong' : 'span');
            inner.textContent = content;
            if (color) inner.style.color = color;
            td.appendChild(inner);
            tr.appendChild(td);
        };
        
        const addBadgeTd = (content, status) => {
            const td = document.createElement('td');
            const span = document.createElement('span');
            span.textContent = content;
            let badgeClass = 'badge ';
            if (status === 'PASS') badgeClass += 'bg-pass';
            else if (status === 'FAIL' || status === 'ERROR') badgeClass += 'bg-fail';
            else if (status === 'WARNING') badgeClass += 'bg-warn';
            else badgeClass += 'bg-unknown';
            
            span.className = badgeClass;
            td.appendChild(span);
            tr.appendChild(td);
        };

        addTd(issue.stage, null, true);
        addBadgeTd(issue.status, issue.status);
        addTd(issue.file, '#93c5fd', false);
        addTd(issue.line, null, false);
        addTd(issue.func, '#fca5a5', false);
        addTd(issue.reason, null, false);
        addTd(issue.impact, 'var(--accent-warning)', false);
        addTd(issue.dependency, null, false);
        addTd(issue.fix, 'var(--accent-green)', true);
        addTd(issue.confidence, null, true);
        
        tableBody.appendChild(tr);
    });
}

function copyReport() {
    navigator.clipboard.writeText(currentReportText).then(() => {
        alert("Trace copied to clipboard!");
    });
}

function exportReport(type) {
    let content = "";
    let mime = "text/plain";
    let filename = `orbis_diagnostic_report.${type}`;

    if (type === 'json') {
        content = JSON.stringify(currentTraceData, null, 2);
        mime = "application/json";
    } else if (type === 'md') {
        content = "# ORBIS Diagnostic Report\n\n## Root Cause Trace\n\n";
        currentTraceData.forEach(i => {
            content += `### ${i.stage} (${i.status})\n- **File:** \`${i.file}:${i.line}\`\n- **Function:** \`${i.func}\`\n- **Reason:** ${i.reason}\n- **Impact:** ${i.impact}\n- **Fix:** ${i.fix}\n\n`;
        });
        mime = "text/markdown";
    }

    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function generateAIPrompt() {
    const contextText = document.getElementById('modal-desc').innerText;
    const logText = document.getElementById('console-output').innerText.substring(0, 500); 
    
    const promptText = `I am working on the ORBIS Project. I am currently facing an issue and used the Developer Diagnostics V3 platform.\n\n[SYSTEM CONTEXT]\n${contextText}\n\n[LATEST EXECUTION TRACE]\n${currentReportText}\n\n[RECENT LOGS]\n${logText}\n\n[YOUR TASK]\nBased on the Root Cause Engine trace and logs provided above:\n1. Analyze the exact failure point (File, Line, Function).\n2. Explain why this dependency or logic is failing.\n3. Provide the exact corrected code required to apply the 'Suggested Fix'.\nDo not change the core architecture. Focus only on the fix.`;
    
    navigator.clipboard.writeText(promptText).then(() => {
        alert("AI Prompt generated and copied to clipboard! Paste it to your AI Chat.");
    });
}

function copyModalData() {
    const txt = document.getElementById('modal-desc').innerText;
    navigator.clipboard.writeText(txt).then(() => alert("Details Copied!"));
}