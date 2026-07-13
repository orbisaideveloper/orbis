window.Dashboard = {
    startTime: Date.now(),
    
    init: function() {
        this.startUptimeCounter();
        this.setupCardInteractions();
        window.printLog('OK', 'Dashboard System Ready.');
    },

    startUptimeCounter: function() {
        setInterval(() => {
            const el = document.getElementById('sys-uptime');
            if (el) el.innerText = Math.floor((Date.now() - this.startTime) / 1000) + ' s';
        }, 1000);
    },

    setupCardInteractions: function() {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => {
            panel.addEventListener('click', () => {
                const header = panel.querySelector('.panel-header')?.innerText || 'Panel Details';
                const content = panel.innerHTML;
                this.showMinimalModal(header, content);
            });
        });
    },

    showMinimalModal: function(title, content) {
        const modal = document.createElement('div');
        modal.style = "position:fixed; top:10%; left:5%; width:90%; max-height:80vh; background:white; z-index:9999; border:1px solid #ccc; padding:20px; border-radius:8px; overflow-y:auto; box-shadow:0 4px 15px rgba(0,0,0,0.3);";
        modal.innerHTML = `<h3 style="color:var(--navy-blue); margin-bottom:10px;">${title}</h3><hr><div style="margin:15px 0;">${content}</div><button style="width:100%; padding:10px; background:var(--navy-blue); color:white; border:none; border-radius:4px;" onclick="this.parentElement.remove()">CLOSE</button>`;
        document.body.appendChild(modal);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.Dashboard.init();
});
