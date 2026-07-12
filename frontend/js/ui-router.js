// js/ui-router.js - Workflow Router
window.WorkflowRouter = {
    route: function(payload) {
        window.printLog('INFO', 'Router: Directing payload...');
        // এখানে লজিক থাকবে যা ডিটেক্ট করবে এটা চ্যাট নাকি ফাইল আপলোড
        window.EventBus.emit('WorkflowStarted', { type: 'GENERAL' });
    }
};
