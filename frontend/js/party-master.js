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
        </style>

        <div class="lottery-workspace">
          ${topNavBar}
          
          <div class="glass-card">
            
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

        // 🟢 Contact Picker API Logic (অপরিবর্তিত রাখা হয়েছে)
        if (contactBtn) {
            contactBtn.addEventListener('click', async () => {
                const supported = ('contacts' in navigator && 'ContactsManager' in window);
                
                if (supported) {
                    try {
                        const props = ['name', 'tel'];
                        const contacts = await navigator.contacts.select(props, { multiple: false });
                        
                        if (contacts.length > 0) {
                            const contact = contacts[0];
                            
                            // Set Name
                            if (contact.name && contact.name.length > 0) {
                                nameInput.value = contact.name[0];
                            }
                            
                            // Set Phone Number (Format to last 10 digits)
                            if (contact.tel && contact.tel.length > 0) {
                                let phone = contact.tel[0].replace(/\D/g, ''); 
                                if (phone.length >= 10) {
                                    phone = phone.slice(-10); 
                                }
                                mobileInput.value = phone;
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        alert("কন্টাক্ট নিতে সমস্যা হয়েছে বা আপনি ক্যানসেল করেছেন।");
                    }
                } else {
                    alert("আপনার ব্রাউজারে ডাইরেক্ট কন্টাক্ট সাপোর্ট করছে না। দয়া করে ম্যানুয়ালি টাইপ করুন। (অ্যান্ড্রয়েড ক্রোম ব্রাউজারে এটি ভালো কাজ করে)");
                }
            });
        }

        // 🟢 Save Party Logic (আপডেট করা হয়েছে Offline Queue এর জন্য)
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const name = nameInput.value.trim();
                const mobile = mobileInput.value.trim();
                const category = categoryInput.value;
                const balance = parseFloat(balanceInput.value) || 0;

                // Validation
                if (!category) return alert("দয়া করে ক্যাটাগরি সিলেক্ট করুন!");
                if (mobile.length !== 10) return alert("দয়া করে সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন!");
                if (!name) return alert("দয়া করে পার্টির নাম দিন!");

                // Payload for Database Service (ORB-ID স্বয়ংক্রিয়ভাবে জেনারেট হবে)
                const partyData = {
                    category: category,
                    name: name,
                    mobile: mobile,
                    opening_balance: balance,
                    created_at: new Date().toISOString()
                };

                // UI Update: Button Disabled and Text Changed
                saveBtn.innerText = "⏳ Saving to Queue...";
                saveBtn.disabled = true;
                
                try {
                    // 🔗 কল করা হচ্ছে আমাদের নতুন DatabaseService কে
                    if (window.DatabaseService) {
                        const result = await window.DatabaseService.saveParty(partyData);
                        
                        if (result.success) {
                            alert(`✅ ${name} has been saved locally!\nORB-ID: ${result.orb_id}\n\n(It will sync to server automatically)`);
                            
                            // Reset Form for next entry
                            nameInput.value = '';
                            mobileInput.value = '';
                            balanceInput.value = '0';
                            categoryInput.value = '';
                        } else {
                            alert('❌ Error saving party: ' + result.error);
                        }
                    } else {
                        alert("❌ System Error: Database Service not found! Please check connection.");
                    }
                } catch (error) {
                    console.error("Save Error:", error);
                    alert("❌ Unexpected error occurred while saving.");
                } finally {
                    // UI Restore
                    saveBtn.innerText = "💾 Save Party Profile";
                    saveBtn.disabled = false;
                }
            });
        }
    }
};
