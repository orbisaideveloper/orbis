document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const workspace = document.querySelector('.workspace');

    // সাইডবার মেনুতে ক্লিক করলে কী হবে তার লজিক
    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Active ক্লাস রিমুভ ও অ্যাড করা
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            const targetText = item.innerText.trim();
            document.querySelector('.breadcrumb .highlight').innerText = targetText;

            // মেনু অনুযায়ী স্ক্রিন লোড করা
            if (targetText.includes('Project Inventory')) {
                await loadInventory(workspace);
            } else if (targetText.includes('System Overview')) {
                loadSystemOverview(workspace);
            } else {
                workspace.innerHTML = `
                <div class="welcome-screen">
                    <h2 style="color: #ef4444; margin-bottom: 10px;">MODULE OFFLINE</h2>
                    <p>This module is currently under construction. (Lego Block missing)</p>
                </div>`;
            }
        });
    });
});

// ==========================================
// 📦 PROJECT INVENTORY LOADER
// ==========================================
async function loadInventory(workspace) {
    // স্ক্যানিং অ্যানিমেশন দেখানো
    workspace.innerHTML = `
    <div class="terminal-box" style="border-color: var(--accent);">
        <div class="term-header">Terminal [root@orbis] - God Mode Scanner Active</div>
        <div class="term-body">
            &gt; Initializing File Scanner...<br>
            &gt; Scanning directories...<br>
            &gt; Counting modules...<br>
            <span class="cursor">_</span>
        </div>
    </div>`;

    try {
        // ব্যাকএন্ড API থেকে ডেটা আনা
        const response = await fetch('/developer-center/api/inventory');
        const result = await response.json();

        if (result.status === 'SUCCESS') {
            const data = result.data;
            
            // ১ সেকেন্ড পর সুন্দর ড্যাশবোর্ড স্টাইলে ডেটা দেখানো
            setTimeout(() => {
                workspace.innerHTML = `
                <h2 style="color: var(--accent); margin-bottom: 20px; font-family: var(--font-code);">📦 Project Inventory Scanned</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    
                    <div style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">TOTAL FILES</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px;">${data.totalFiles}</p>
                    </div>
                    
                    <div style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">JAVASCRIPT (.js)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #f7df1e;">${data.jsFiles}</p>
                    </div>
                    
                    <div style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">HTML (.html)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #e34f26;">${data.htmlFiles}</p>
                    </div>
                    
                    <div style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">CSS (.css)</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: #1572b6;">${data.cssFiles}</p>
                    </div>
                    
                    <div style="background: var(--bg-panel); padding: 20px; border: 1px solid var(--border); border-radius: 8px;">
                        <h3 style="color: var(--text-muted); font-size: 12px; font-family: var(--font-code);">PROJECT SIZE</h3>
                        <p style="font-size: 28px; font-weight: bold; margin-top: 10px; color: var(--accent);">${data.totalSizeMB} MB</p>
                    </div>

                </div>

                <div class="terminal-box" style="margin-top: 30px;">
                    <div class="term-header">System Log</div>
                    <div class="term-body" style="font-size: 12px;">
                        &gt; Scan completed successfully at ${new Date(result.timestamp).toLocaleTimeString()}.<br>
                        &gt; Core logic systems are stable.<br>
                        &gt; Awaiting next command...<br>
                        <span class="cursor" style="color: var(--accent);">_</span>
                    </div>
                </div>`;
            }, 1000);
        } else {
             workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; ERROR: ${result.message}</div></div>`;
        }
    } catch (error) {
         workspace.innerHTML = `<div class="terminal-box" style="border-color: red;"><div class="term-body" style="color: red;">&gt; CRITICAL ERROR: Could not connect to Engine API.</div></div>`;
    }
}

// ==========================================
// 📊 SYSTEM OVERVIEW LOADER
// ==========================================
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
