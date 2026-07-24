document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const workspace = document.querySelector('.workspace');

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
                workspace.innerHTML = `
                <div class="welcome-screen">
                    <h2 style="color: #ef4444; margin-bottom: 10px;">MODULE STANDBY</h2>
                    <p>Connecting logic blocks... Awaiting deployment.</p>
                </div>`;
            }
        });
    });
});

// ==========================================
// 📦 PROJECT INVENTORY LOADER (UPDATED WITH FILE LISTS)
// ==========================================
async function loadInventory(workspace) {
    workspace.innerHTML = `
    <div class="terminal-box" style="border-color: var(--accent);">
        <div class="term-header">Terminal [root@orbis] - Scanner Active</div>
        <div class="term-body">
            &gt; Initializing File Scanner...<br>
            &gt; Extracting file structures...<br>
            <span class="cursor">_</span>
        </div>
    </div>`;

    try {
        const response = await fetch('/developer-center/api/inventory');
        const result = await response.json();

        if (result.status === 'SUCCESS') {
            const data = result.data;
            
            // ফাইলের লিস্ট বানানোর হেল্পার ফাংশন
            const createListHTML = (listId, fileArray) => {
                const listItems = fileArray.map(f => `<li style="padding: 4px 0; border-bottom: 1px dashed #3f3f46;">📄 ${f}</li>`).join('');
                return `
                <div id="${listId}" style="display: none; margin-top: 15px; background: #000; padding: 10px; border: 1px solid var(--border); border-radius: 4px; max-height: 150px; overflow-y: auto;">
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 11px; font-family: var(--font-code); color: var(--text-muted);">
                        ${listItems || '<li>No files found.</li>'}
                    </ul>
                </div>`;
            };

            setTimeout(() => {
                workspace.innerHTML = `
                <h2 style="color: var(--accent); margin-bottom: 20px; font-family: var(--font-code);">📦 Project Inventory Scanned</h2>
                <p style="color: var(--text-muted); font-size: 12px; margin-bottom: 20px;">Click on a card to expand and view the files.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
                    
                    <!-- JS Files Card -->
                    <div onclick="toggleList('js-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: 0.3s;" onmouseover="this.style.borderColor='#f7df1e'" onmouseout="this.style.borderColor='var(--border)'">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">JAVASCRIPT (.js)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #f7df1e;">${data.jsFilesCount}</p>
                        ${createListHTML('js-list', data.jsList)}
                    </div>
                    
                    <!-- HTML Files Card -->
                    <div onclick="toggleList('html-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: 0.3s;" onmouseover="this.style.borderColor='#e34f26'" onmouseout="this.style.borderColor='var(--border)'">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">HTML (.html)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #e34f26;">${data.htmlFilesCount}</p>
                        ${createListHTML('html-list', data.htmlList)}
                    </div>
                    
                    <!-- CSS Files Card -->
                    <div onclick="toggleList('css-list')" style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: 0.3s;" onmouseover="this.style.borderColor='#1572b6'" onmouseout="this.style.borderColor='var(--border)'">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">CSS (.css)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #1572b6;">${data.cssFilesCount}</p>
                        ${createListHTML('css-list', data.cssList)}
                    </div>
                    
                    <!-- Total Size Card -->
                    <div style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">PROJECT SIZE</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: var(--accent);">${data.totalSizeMB} MB</p>
                        <p style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">Total Files: ${data.totalFiles}</p>
                    </div>

                </div>`;
            }, 800);
        }
    } catch (error) {
         workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; CRITICAL ERROR: API Connection Failed.</div></div>`;
    }
}

// Helper function to toggle lists
window.toggleList = function(id) {
    const el = document.getElementById(id);
    if (el.style.display === 'none') {
        el.style.display = 'block';
    } else {
        el.style.display = 'none';
    }
};

function loadSystemOverview(workspace) {
    workspace.innerHTML = `
        <div class="welcome-screen">
            <h2 class="glitch">SYSTEM ONLINE</h2>
            <p>Lego Architecture Active. Ready for deep scan.</p>
            <div class="terminal-box">
                <div class="term-header">Terminal [root@orbis]</div>
                <div class="term-body">
                    &gt; Engine connected successfully.<br>
                    &gt; Ready to analyze source code.<br>
                    <span class="cursor">_</span>
                </div>
            </div>
        </div>
    `;
}
