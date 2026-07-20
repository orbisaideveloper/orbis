loadModule: async function(moduleName) {
    // UI Toggle Logic: চ্যাট সেকশন এবং টপ-ন্যাভ (হেডার) দুটোকেই ধরছি
    const chatSection = document.querySelector('.chat-section');
    const topNav = document.querySelector('.top-nav');

    if (moduleName === 'lottery' || moduleName.includes('lottery')) {
        // লটারি হলে চ্যাট এবং হেডার দুটোই হাইড হবে
        if (chatSection) chatSection.style.display = 'none';
        if (topNav) topNav.style.display = 'none';
    } else {
        // অন্যথায় আবার আগের মতো দেখাবে
        if (chatSection) chatSection.style.display = '';
        if (topNav) topNav.style.display = 'flex';
    }

    if (moduleName === 'home') {
        return;
    }

    // ... (আপনার ফাইলের বাকি কোড যেমন ছিল তেমনই থাকবে)
