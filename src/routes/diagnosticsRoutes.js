let currentReportText = ""; 
let currentTraceData = [];

document.addEventListener('DOMContentLoaded', () => {
    runInitialScan();
    fetchLogs();
    
    const searchBox = document.getElementById('search-input');
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch(e.target.value.trim());
    });
});

async function runInitialScan() {
    try {
        const response = await fetch('/api/diagnostics/health');
        const data = await response.json();
        const grid = document.getElementById('health-grid');
        grid.innerHTML = ''; 

        const createCard = (title, val, status, detail, cClass = '') => {
            const card = document.createElement('div');
            let baseClass = 'health-card ' + cClass;
            if (status === 'FAIL') baseClass += ' fail-card';
            else if (status === 'WARN') baseClass += ' warn-card';
            
            card.className = baseClass.trim();
            card.onclick = () => openModal(title, detail);
            
            card.innerHTML = `
                <h3>${title}</h3>
                <div class="value" style="color: ${status === 'FAIL' ? 'var(--accent-red)' : status === 'WARN' ? 'var(--accent-warning)' : 'var(--accent-green)'}">
                    ${val}
                </div>
            `;
            return card;
        };

        grid.appendChild(createCard('Overall Health Score', `${data.score} / 100`, data.score > 80 ? 'PASS' : 'WARN', `Score calculated based on runtime integrity.\nChecked at: ${new Date().toLocaleTimeString()}`, 'score-card'));
        grid.appendChild(createCard('Project Health', data.project.value, data.project.status, data.project.detail));
        grid.appendChild(createCard('Server RAM Load', data.ram.value, data.ram.status, data.ram.detail));
        grid.appendChild(createCard('Dependency Health', data.dependency.value, data.dependency.status, data.dependency.detail));
        grid.appendChild(createCard('Console Health', data.console.value, data.console.status, data.console.detail));
        
    } catch (error) { 
        document.getElementById('health-grid').innerHTML = '<div style="color:red;">Engine Offline. Could not fetch live data.</div>';
    }
}

async function fetchLogs() {
    const consoleEl = document.getElementById('console-output');
    try {
        const response = await fetch('/api/diagnostics/logs');
        const data = await response.json();
        consoleEl.textContent = data.logs || "System logs are clean.";
    } catch (error) {
        consoleEl.textContent = "Failed to connect to Multi-Log Server.";
    }
}

async function handleSearch(query) {
    if(!query) return;
    const tableBody = document.getElementById('report-body');
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-warning);">Engine Analyzing Intent: "${query}"...</td></tr>`;
    
    try {
        const response = await fetch('/api/diagnostics/scan', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ query }) 
        });
        const data = await response.json();
        generateReport(data.issues || []);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red);">Root Cause Engine Unreachable.</td></tr>`;
    }
}

function generateReport(issues) {
    const tableBody = document.getElementById('report-body');
    tableBody.innerHTML = ''; 
    currentTraceData = issues;
    currentReportText = "ORBIS ROOT CAUSE EXPORT\n=======================\n\n";

    if(issues.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No anomalies detected.</td></tr>`;
        return;
    }

    issues.forEach(issue => {
        currentReportText += `Stage: ${issue.stage}\nStatus: ${issue.status}\nFile: ${issue.file}:${issue.line}\nImpact: ${issue.impact}\nReason: ${issue.reason}\nFix: ${issue.suggestedFix}\n-----------------------\n`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${issue.stage}</strong></td>
            <td><span style="color: ${issue.status==='FAIL' ? '#ef4444' : issue.status==='WARN' ? '#f59e0b' : '#10b981'}">${issue.status}</span></td>
            <td style="color: #93c5fd;">${issue.file}</td>
            <td>${issue.line}</td>
            <td style="color: #f59e0b;">${issue.impact}</td>
            <td><div style="font-size:11px; margin-bottom:4px;">${issue.reason}</div><strong style="color:#10b981; font-size:11px;">Fix: ${issue.suggestedFix}</strong></td>
        `;
        tableBody.appendChild(tr);
    });
}

function copyReport() {
    navigator.clipboard.writeText(currentReportText).then(() => alert("Trace copied!"));
}

function exportReport(type) {
    let content = type === 'json' ? JSON.stringify(currentTraceData, null, 2) : currentReportText;
    const blob = new Blob([content], { type: type === 'json' ? "application/json" : "text/plain" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orbis_report.${type}`;
    a.click();
}

function openModal(title, detail) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-desc').innerText = detail;
    document.getElementById('infoModal').style.display = 'block';
}

function closeModal() { document.getElementById('infoModal').style.display = 'none'; }
window.onclick = function(event) { if (event.target === document.getElementById('infoModal')) closeModal(); }
