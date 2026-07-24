// 📝 frontend/js/party-master.js (DigiLedger: Simple Party Master - Offline First Integrated)

window.PartyMaster = {
    mount: function(container) {
        const topNavBar = window.LotteryUserUI ? window.LotteryUserUI.getTopNavBar("👥 Add New Party") : "";

        container.innerHTML = `
        <style>
          .lottery-workspace { font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px; color: #333; background: #f8f9fa; min-height: 100vh; border-radius: 12px; }
          .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 25px; margin-top: 15px; }
          .form-group { margin-bottom: 20px; }
          .form-label { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 600; color: #555; margin-bottom: 8px; text-transform: uppercase; }
          .form-control { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; outline: none; transition: border 0.3s; box-sizing: border-box; }
          .form-control:focus { border-color: #0052cc; box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1); }
          select.form-control { appearance: none; background-color: #fff; cursor: pointer; }
          
          .btn-contact { background: rgba(0, 82, 204, 0.1); color: #0052cc; border: 1px solid #0052cc; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; font-weight: bold; transition: all 0.2s; }
          .btn-contact:hover { background: #0052cc; color: white; }

          .btn-save { background: linear-gradient(135deg, #0052cc, #003d99); color: white; width: 100%; padding: 15px; border: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; margin-top: 10px; box-shadow: 0 4px 10px rgba(0, 82, 204, 0.2); transition: transform 0.2s; }
          .btn-save:hover { transform: translateY(-2px); }
          .btn-save:disabled { background: #999; cursor: not-allowed; box-shadow: none; transform: none; }

          /* Table Styles for Party List */
          .table-container { overflow-x: auto; margin-top: 15px; }
          .party-table { width: 100%; border-collapse: collapse; text-align: left; }
          .party-table th { background: rgba(0, 82, 204, 0.08); color: #0052cc; padding: 12px; font-size: 0.9rem; text-transform: uppercase; border-bottom: 2px solid #e1e7f0; }
          .party-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 0.95rem; }
          .party-table tr:hover { background-color: #f8fafc; }
          .badge-category { background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: #475569; text-transform: capitalize; }
        </style>

        <div class="lottery-workspace">
          ${topNavBar}
          
          <!-- Add Party Form -->
          <div class="glass-card">
            <h3 style="margin-top: 0; color: #333; margin-bottom: 20px; font-size: 1.2rem;">➕ Add New Party</h3>
            <div class="form-group">
                <label class="form-label">Category / Type</label>
                <select class="form-control" id="party-category">
                    <option value="" disabled selected>Select Party Type...</option>
                    <option value="seller">Retailer / Seller (যাকে মাল দেব)</option>
                    <option value="mahajan">Mahajan / Supplier (যার থেকে মাল নেব)</option>
                    <option value="cash_customer">Cash Customer (খুচরো খরিদ্দার)</option>
                    <option value="expense">Expense / Model (খরচার খাতা)</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">
                    Mobile Number
                    <button class="btn-contact" id="btn-pick-contact">📖 Pick from Contacts</button>
                </label>
                <input type="tel" class="form-control" id="party-mobile" placeholder="10-digit mobile number">
                <small style="color: #888; font-size: 0.8rem; margin-top: 4px; display: block;">পার্টির সাথে যোগাযোগের জন্য সঠিক নম্বর দিন।</small>
            </div>

            <div class="form-group">
                <label class="form-label">Party Name</label>
                <input type="text" class="form-control" id="party-name" placeholder="Name as per phonebook">
            </div>

            <div class="form-group">
                <label class="form-label">Opening Balance (₹)</label>
                <input type="number" class="form-control" id="party-balance" placeholder="0.00" value="0">
                <small style="color: #888; font-size: 0.8rem; margin-top: 4px; display: block;">(+ for Advance, - for Due)</small>
            </div>

            <button class="btn-save" id="btn-save-party">💾 Save Party Profile</button>
          </div>

          <!-- Saved Parties Directory (নতুন যোগ করা হয়েছে) -->
          <div class="glass-card">
            <h3 style="margin-top: 0; color: #333; margin-bottom: 10px; font-size: 1.2rem;">📋 Saved Parties Directory</h3>
            <div class="table-container">
                <table class="party-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Mobile</th>
                            <th>Category</th>
                            <th>Balance (₹)</th>
                        </tr>
                    </thead>
                    <tbody id="party-list-body">
                        <tr><td colspan="4" style="text-align: center; color: #888;">Loading parties...</td></tr>
                    </tbody>
                </table>
            </div>
          </div>

        </div>
        `;

        this.initLogic();
    },

    initLogic: function() {
        const mobileInput = document.getElementById('party-mobile');
        const nameInput = document.getElementById('party-name');
        const categoryInput = document.getElementById('party-category');
        const balanceInput = document.getElementById('party-balance');
        const saveBtn = document.getElementById('btn-save-party');
        const contactBtn = document.getElementById('btn-pick-contact');
        const listBody = document.getElementById('party-list-body');

        // 🟢 Party List Load করার ফাংশন
        const loadPartyList = async () => {
            try {
                let parties = [];
                // যদি DatabaseService এ getAllParties মেথড থাকে
                if (window.DatabaseService && typeof window.DatabaseService.getAllParties === 'function') {
                    parties = await window.DatabaseService.getAllParties();
                } else {
                    // Fallback: LocalStorage থেকে ডেটা খোঁজার চেষ্টা (আপনার সিস্টেমে যে Key থাকুক)
                    const keysToCheck = ['orbis_parties', 'offline_parties', 'digiledger_parties', 'partiesDB'];
                    for (let key of keysToCheck) {
                        let data = localStorage.getItem(key);
                        if (data) {
                            parties = JSON.parse(data);
                            break;
                        }
                    }
                }

                if (!parties || parties.length === 0) {
                    listBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888; padding: 20px;">কোনো পার্টি এখনো সেভ করা হয়নি।</td></tr>`;
                    return;
                }

                // নতুনগুলো উপরে দেখানোর জন্য reverse করা হলো
                const reversedParties = [...parties].reverse();

                listBody.innerHTML = reversedParties.map(p => {
                    const bal = parseFloat(p.opening_balance || 0);
                    const balColor = bal < 0 ? '#ef4444' : (bal > 0 ? '#10b981' : '#334155');
                    return `
                        <tr>
                            <td style="font-weight: 600; color: #1e293b;">${p.name}</td>
                            <td>${p.mobile}</td>
                            <td><span class="badge-category">${(p.category || 'N/A').replace('_', ' ')}</span></td>
                            <td style="color: ${balColor}; font-weight: bold;">₹ ${Math.abs(bal).toFixed(2)} ${bal < 0 ? '(Due)' : (bal > 0 ? '(Adv)' : '')}</td>
                        </tr>
                    `;
                }).join('');

            } catch (error) {
                console.error("Error loading parties:", error);
                listBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444;">পার্টি লিস্ট লোড করতে সমস্যা হয়েছে।</td></tr>`;
            }
        };

        // পেজ লোড হওয়ার সাথে সাথে একবার লিস্টটা ডেকে নেওয়া
        loadPartyList();

        // 🟢 Contact Picker API Logic (অপরিবর্তিত)
        if (contactBtn) {
            contactBtn.addEventListener('click', async () => {
                const supported = ('contacts' in navigator && 'ContactsManager' in window);
                
                if (supported) {
                    try {
                        const props = ['name', 'tel'];
                        const contacts = await navigator.contacts.select(props, { multiple: false });
                        
                        if (contacts.length > 0) {
                            const contact = contacts[0];
                            if (contact.name && contact.name.length > 0) nameInput.value = contact.name[0];
                            if (contact.tel && contact.tel.length > 0) {
                                let phone = contact.tel[0].replace(/\D/g, ''); 
                                if (phone.length >= 10) phone = phone.slice(-10); 
                                mobileInput.value = phone;
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        alert("কন্টাক্ট নিতে সমস্যা হয়েছে বা আপনি ক্যানসেল করেছেন।");
                    }
                } else {
                    alert("আপনার ব্রাউজারে ডাইরেক্ট কন্টাক্ট সাপোর্ট করছে না। দয়া করে ম্যানুয়ালি টাইপ করুন।");
                }
            });
        }

        // 🟢 Save Party Logic
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const name = nameInput.value.trim();
                const mobile = mobileInput.value.trim();
                const category = categoryInput.value;
                const balance = parseFloat(balanceInput.value) || 0;

                if (!category) return alert("দয়া করে ক্যাটাগরি সিলেক্ট করুন!");
                if (mobile.length !== 10) return alert("দয়া করে সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন!");
                if (!name) return alert("দয়া করে পার্টির নাম দিন!");

                const partyData = {
                    id: 'P' + Date.now(), // Fallback ID
                    category: category,
                    name: name,
                    mobile: mobile,
                    opening_balance: balance,
                    created_at: new Date().toISOString()
                };

                saveBtn.innerText = "⏳ Saving to Queue...";
                saveBtn.disabled = true;
                
                try {
                    if (window.DatabaseService) {
                        const result = await window.DatabaseService.saveParty(partyData);
                        
                        if (result.success) {
                            alert(`✅ ${name} has been saved locally!`);
                            
                            // ফর্ম রিসেট
                            nameInput.value = '';
                            mobileInput.value = '';
                            balanceInput.value = '0';
                            categoryInput.value = '';

                            // 🔄 নতুন পার্টি সেভ হওয়ার সাথে সাথে লিস্ট আপডেট করা
                            await loadPartyList();
                        } else {
                            alert('❌ Error saving party: ' + result.error);
                        }
                    } else {
                        // Fallback: যদি DatabaseService না থাকে তবে লোকাল স্টোরেজে সরাসরি সেভ (টেস্টিংয়ের জন্য)
                        let existing = JSON.parse(localStorage.getItem('orbis_parties') || '[]');
                        existing.push(partyData);
                        localStorage.setItem('orbis_parties', JSON.stringify(existing));
                        
                        alert(`✅ ${name} has been saved to LocalStorage!`);
                        nameInput.value = ''; mobileInput.value = ''; balanceInput.value = '0'; categoryInput.value = '';
                        await loadPartyList(); // লিস্ট আপডেট
                    }
                } catch (error) {
                    console.error("Save Error:", error);
                    alert("❌ Unexpected error occurred while saving.");
                } finally {
                    saveBtn.innerText = "💾 Save Party Profile";
                    saveBtn.disabled = false;
                }
            });
        }
    }
};
