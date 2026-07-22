}
let currentTrace = [];
let rawResponse = null;

document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch(e.target.value.trim());
});

async function handleSearch(query) {
    const tb = document.getElementById('report-body');
    tb.innerHTML = '<tr><td colspan="6">Analyzing...</td></tr>';
    
    try {
        const res = await fetch('/api/diagnostics/scan', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query })
        });
        const data = await res.json();
        rawResponse = data;
        currentTrace = data.issues || [];
        
        renderTable(currentTrace);
        renderSmartData(data.smartReport);
    } catch (e) {
        tb.innerHTML = '<tr><td colspan="6" style="color:red;">API Error</td></tr>';
    }
}

function renderTable(issues) {
    const tb = document.getElementById('report-body');
    tb.innerHTML = '';
    issues.forEach(i => {
        tb.innerHTML += `<tr>
            <td><strong>${i.stage}</strong></td>
            <td><span class="badge">${i.status}</span></td>
            <td style="color:#93c5fd;">${i.file}</td>
            <td style="color:#fca5a5;">${i.function}</td>
            <td>${i.impact}</td>
            <td style="color:#10b981;">${i.fix}</td>
        </tr>`;
    });
}

function renderSmartData(smart) {
    const evPanel = document.getElementById('evidence-panel');
    const evCon = document.getElementById('evidence-content');
    const fixPanel = document.getElementById('fix-panel');
    const fixCon = document.getElementById('fix-content');

    if (smart && smart.evidence) {
        evPanel.style.display = 'block';
        evCon.innerText = JSON.stringify(smart.evidence, null, 2);
    } else { evPanel.style.display = 'none'; }

    if (smart && smart.fix) {
        fixPanel.style.display = 'block';
        fixCon.innerText = JSON.stringify(smart.fix, null, 2);
    } else { fixPanel.style.display = 'none'; }
}

// --- PHASE 4: STRICT COPY SYSTEM (NO DOWNLOADS) ---
function copySection(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
}

function copyFormat(type) {
    if (!rawResponse) return alert("No data to copy!");
    let content = "";
    
    if (type === 'json') {
        content = JSON.stringify(rawResponse, null, 2);
    } else if (type === 'md') {
        content = "## ORBIS Execution Trace\n";
        currentTrace.forEach(i => content += `- **${i.stage}** (${i.status}): ${i.file} -> ${i.fix}\n`);
    } else if (type === 'trace') {
        content = currentTrace.map(i => `${i.stage} | ${i.status} | ${i.file} | ${i.fix}`).join('\n');
    }
    
    navigator.clipboard.writeText(content).then(() => alert(`${type.toUpperCase()} copied perfectly!`));
}
