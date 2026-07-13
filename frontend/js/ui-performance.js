// js/ui-performance.js
window.PerformanceMonitor = {
    init: function() {
        setInterval(() => {
            // RAM Usage (যদি ব্রাউজার সাপোর্ট করে)
            if (window.performance && window.performance.memory) {
                const ram = Math.round(window.performance.memory.usedJSHeapSize / 1048576);
                window.Dashboard.updateMetric('sys-ram', `${ram} MB`);
            }
        }, 2000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.PerformanceMonitor.init();
});
