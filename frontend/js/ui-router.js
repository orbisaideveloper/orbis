// js/ui-router.js - Universal Workflow Router
window.ORBISRouter = {
    init: function() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        window.addEventListener('load', this.handleRoute.bind(this));
    },

    handleRoute: function() {
        const hash = window.location.hash.replace('#', '') || 'home';
        window.printLog('INFO', `Router: Navigating to ${hash}`);
        
        // শুধু একটি ইভেন্ট ফায়ার করবে, রাউটার নিজে মডিউল চিনবে না
        if(window.EventBus) {
            window.EventBus.emit('NavigateTo', { target: hash });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => window.ORBISRouter.init());
