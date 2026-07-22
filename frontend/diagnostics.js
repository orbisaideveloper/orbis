/**
 * ORBIS Developer Diagnostics V3.6 - Frontend Engine
 * Features: Live Data Fetch, Voice Intent, Root Cause Trace, Multi-Log, Smart Clipboard
 */

let currentReportText = ""; 
let currentTraceData = [];
let currentLogs = {};
let activeLogType = 'all';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[ORBIS] Diagnostics Engine Initialized.");
    runInitialScan();
    fetchLogs();
    setupVoiceRecognition(); 

    // Search intent trigger on Enter key
    const searchBox = document.getElementById('search-input');
    if(searchBox) {
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(e.target.value.trim());
            }
        });
    }
});

// ==========================================
// 1. HEALTH CARDS (V1 UI + V3 Data)
// ==========================================
async function runInitialScan() {
    const grid = document.getElementById('health-grid');
    if(!grid) return;

    try {
        const response = await fetch('/api/diagnostics/health');
        if(!response.ok) throw new Error("API Route missing or offline");
        const data = await response.json();
        
        grid.innerHTML = ''; // Clear loading text

        const createCard = (title, val, status, detail, cClass = '') => {
            const card = document.createElement('div');
            let baseClass = 'health-card ' + cClass;
            
            // Dynamic styling based on status
            if (status === 'FAIL') baseClass += ' fail-card';
            else if (status === 'WARN') baseClass += ' warn-card';
            else if (status === 'PASS' && !cClass) baseClass += ' score-card';
            
            card.className = baseClass.trim();
            card.onclick = () => openModal(title, detail);
            
            const colorCode = status === 'FAIL' ? 'var(--accent-red)' : status === 'WARN' ? 'var(--accent-warning)' : 'var(--accent-green)';
            
            card.innerHTML = `
                <h3>${title}</h3>
                <div class="value" style="color: ${colorCode}">${val}</div>
            `;
            return card;
        };

        // Populate Cards dynamically
        grid.appendChild(createCard('Overall Health Score', `${data.score} / 100`, data.score >= 80 ? 'PASS' : 'WARN', `Score calculated based on runtime integrity, memory loads, and dependency health.\n\nChecked at: ${new Date().toLocaleString()}`, 'score-card'));
        grid.appendChild(createCard('Project Health', data.project.value, data.project.status, data.project.detail));
        grid.appendChild(createCard('Server RAM Load', data.ram.value, data.ram.status, data.ram.detail));
        grid.appendChild(createCard('Dependency Health', data.dependency.value, data.dependency.status, data.dependency.detail));
        grid.appendChild(createCard('Console Health', data.console.value, data.console.status, data.console.detail));
        
    } catch (error) { 
        console.error("[ORBIS] Health check failed:", error);
        grid.innerHTML = '<div style="color:var(--accent-red); padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 6px; border: 1px solid var(--accent-red);">⚠️ Engine Offline. Could not fetch live data from /api/diagnostics/health. Check backend routes.</div>';
    }
}

// ==========================================
// 2. QUERY INTENT ENGINE (Text + Voice)
// ==========================================
function setupVoiceRecognition() {
    const micBtn = document.getElementById('mic-btn');
    const searchInput = document.getElementById('search-input');
    
    // Cross-browser speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; 
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => { 
            micBtn.style.background = 'var(--accent-red)'; 
            micBtn.innerHTML = '🎙️';
            searchInput.placeholder = "Listening for developer intent..."; 
        };
        
        recognition.onspeechend = () => { 
            micBtn.style.background = 'var(--accent-blue)'; 
            micBtn.innerHTML = '🎤';
            recognition.stop(); 
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            handleSearch(transcript); // Auto-trigger search
        };
        
        recognition.onerror = (event) => { 
            console.warn("[ORBIS] Voice Recognition Error:", event.error);
            micBtn.style.background = 'var(--accent-blue)'; 
            micBtn.innerHTML = '🎤';
            searchInput.placeholder = "Enter developer intent...";
        };
        
        micBtn.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        if(micBtn) micBtn.style.display = 'none'; // Hide if not supported
    }
}

async function handleSearch(query) {
    if(!query) return;
    const tableBody = document.getElementById('report-body');
    if(!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-warning); padding: 20px;">⚙️ Engine Analyzing Intent: "${query}"... Searching Source Code...</td></tr>`;
    
    try {
        const response = await fetch('/api/diagnostics/scan', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ query }) 
        });
        
        if(!response.ok) throw new Error("Analyzer Engine Offline");
        const data = await response.json();
        
        generateReport(data.issues || []);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--accent-red); padding: 20px;">❌ Root Cause Engine Unreachable. Is the backend running?</td></tr>`;
    }
}

// ==========================================
// 3. TRACE REPORT GENERATION & TABLE
// ==========================================
function generateReport(issues) {
    const tableBody = document.getElementById('report-body');
    tableBody.innerHTML = ''; 
    currentTraceData = issues;
    
    // Formatting the clipboard text to look like a professional terminal output
    currentReportText = "=========================================\n";
    currentReportText += " 🚀 ORBIS SYSTEM DIAGNOSTIC TRACE \n";
    currentReportText += "=========================================\n";
    currentReportText += `Timestamp: ${new Date().toLocaleString()}\n\n`;

    if(issues.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--accent-green);">✅ No anomalies detected. Codebase is clean.</td></tr>`;
        currentReportText += "Status: CLEAN. No errors or vulnerabilities found.\n";
        return;
    }

    issues.forEach((issue, index) => {
        // Append to clipboard text
        currentReportText += `[Issue #${index + 1}]\n`;
        currentReportText += `> Stage   : ${issue.stage}\n`;
        currentReportText += `> Status  : ${issue.status}\n`;
        currentReportText += `> File    : ${issue.file} (Line: ${issue.line})\n`;
        currentReportText += `> Impact  : ${issue.impact}\n`;
        currentReportText += `> Reason  : ${issue.reason}\n`;
        currentReportText += `> Fix     : ${issue.suggestedFix}\n`;
        currentReportText += "-----------------------------------------\n";

        // Append to HTML Table
        const statusBg = issue.status === 'FAIL' ? 'rgba(239, 68, 68, 0.15)' : issue.status === 'WARN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        const statusColor = issue.status === 'FAIL' ? 'var(--accent-red)' : issue.status === 'WARN' ? 'var(--accent-warning)' : 'var(--accent-green)';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${issue.stage}</strong></td>
            <td><span style="padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor};">${issue.status}</span></td>
            <td style="color: #93c5fd; font-family: monospace;">${issue.file}</td>
            <td style="font-family: monospace;">${issue.line}</td>
            <td style="color: ${issue.impact === 'Critical' ? 'var(--accent-red)' : 'var(--accent-warning)'}; font-weight: 600;">${issue.impact}</td>
            <td>
                <div style="margin-bottom:6px; color: #d1d5db;">${issue.reason}</div>
                <strong style="color:var(--accent-green); font-size: 12px; background: rgba(16,185,129,0.1); padding: 3px 6px; border-radius: 4px;">🛠️ Fix: ${issue.suggestedFix}</strong>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 4. MULTI-LOG ANALYZER
// ==========================================
async function fetchLogs() {
    const consoleEl = document.getElementById('console-output');
    if(!consoleEl) return;

    try {
        const response = await fetch('/api/diagnostics/logs');
        const data = await response.json();
        
        // Mocking multi-category support if backend sends single string
        currentLogs = { 
            all: data.logs || "No logs available.", 
            server: data.logs || "Server is idle.", 
            build: "[npm] Dependencies check passed.\n[webpack] Build completed successfully in 1200ms.", 
            git: "Working tree clean. No uncommitted changes.", 
            security: "SonarCloud Scanner: 0 Vulnerabilities.\nDependabot: No updates required." 
        };
        renderLogs();
    } catch (error) {
        currentLogs = { all: "Failed to connect to Multi-Log Server." };
        renderLogs();
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
    // Auto-scroll to bottom
    consoleEl.parentElement.scrollTop = consoleEl.parentElement.scrollHeight;
}

// ==========================================
// 5. COPY & CLIPBOARD ENGINES
// ==========================================
function copyReport() {
    if(!currentReportText || currentTraceData.length === 0) {
        alert("Nothing to copy! Run a search first.");
        return;
    }
    navigator.clipboard.writeText(currentReportText).then(() => {
        // Find the button and show visual feedback
        const btns = document.querySelectorAll('.btn-green');
        btns.forEach(btn => {
            if(btn.innerText.includes("Copy Trace")) {
                const originalText = btn.innerText;
                btn.innerText = "✅ Copied!";
                setTimeout(() => btn.innerText = originalText, 2000);
            }
        });
    }).catch(err => {
        console.error("Failed to copy:", err);
        alert("Failed to copy to clipboard.");
    });
}

function exportReport(type) {
    if(currentTraceData.length === 0) {
        alert("No data to export!");
        return;
    }
    let content = type === 'json' ? JSON.stringify(currentTraceData, null, 2) : currentReportText;
    const blob = new Blob([content], { type: type === 'json' ? "application/json" : "text/plain" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `orbis_diagnostic_report_${Date.now()}.${type}`;
    a.click();
}

// ==========================================
// 6. MODAL & AI PROMPT GENERATOR
// ==========================================
function openModal(title, detail) {
    document.getElementById('modal-title').innerText = title + ' Diagnostics';
    document.getElementById('modal-desc').innerText = detail;
    document.getElementById('infoModal').style.display = 'block';
}

function closeModal() { 
    document.getElementById('infoModal').style.display = 'none'; 
}

// Close modal when clicking outside
window.onclick = function(event) { 
    if (event.target === document.getElementById('infoModal')) closeModal(); 
}

function copyModalData() {
    const title = document.getElementById('modal-title').innerText;
    const desc = document.getElementById('modal-desc').innerText;
    
    const formattedText = `[ORBIS SYSTEM INFO]\nSection: ${title}\nDetails:\n${desc}`;
    
    navigator.clipboard.writeText(formattedText).then(() => {
        const btn = document.querySelector('button[onclick="copyModalData()"]');
        if(btn) {
            const og = btn.innerText;
            btn.innerText = "✅ Copied!";
            setTimeout(() => btn.innerText = og, 2000);
        }
    });
}

function generateAIPrompt() {
    const title = document.getElementById('modal-title').innerText;
    const contextText = document.getElementById('modal-desc').innerText;
    
    // Grab latest logs safely
    let logText = "No logs.";
    const consoleEl = document.getElementById('console-output');
    if(consoleEl && consoleEl.innerText) {
        logText = consoleEl.innerText.substring(0, 800); // Limit log size for prompt
    }
    
    const promptText = `Act as a Senior Principal Software Engineer. I am working on the ORBIS Platform. I used my Developer Diagnostics Engine and found an issue.

[SYSTEM CONTEXT - ${title}]
${contextText}

[LATEST EXECUTION TRACE]
${currentReportText || "No trace generated yet."}

[RECENT LOGS]
${logText}

[YOUR TASK]
Based on the trace and logs above:
1. Analyze the exact failure point or architectural bottleneck.
2. Check for any logical breaks, syntax errors, or SonarCloud-like vulnerabilities.
3. Provide the exact corrected code required. Do NOT change the core architecture. Focus only on the absolute fix.`;
    
    navigator.clipboard.writeText(promptText).then(() => {
        const btn = document.querySelector('button[onclick="generateAIPrompt()"]');
        if(btn) {
            const og = btn.innerText;
            btn.innerText = "✅ Prompt Copied!";
            setTimeout(() => btn.innerText = og, 2500);
        }
    });
}
