// DigiLedger: Lottery Dispatch Workspace UI Module

export function getDispatchWorkspaceHTML() {
    return `
    <style>
      /* Futuristic Tricolor Glass Theme */
      .lottery-workspace {
        font-family: 'Segoe UI', system-ui, sans-serif;
        padding: 20px;
        color: #333;
        background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
        min-height: 100vh;
      }
    
      /* Glassmorphism Cards */
      .glass-card {
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 16px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
        padding: 20px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .glass-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.1);
      }
    
      /* Dashboard Metrics Row */
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
      }
    
      .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #0052cc;
        margin-top: 8px;
      }
    
      /* Party Search Box (ORB-ID) */
      .party-search-section {
        display: flex;
        gap: 15px;
        margin-bottom: 24px;
        align-items: center;
      }
      
      .glass-input {
        flex: 1;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #d1d5db;
        padding: 14px 20px;
        border-radius: 12px;
        font-size: 16px;
        outline: none;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      }
      
      .glass-input:focus {
        border-color: #0052cc;
        box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.1);
      }
    
      .btn-primary {
        background: linear-gradient(135deg, #0052cc, #0047b3);
        color: white;
        border: none;
        padding: 14px 28px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 82, 204, 0.3);
      }
    
      /* Spreadsheet Entry Grid */
      .spreadsheet-container {
        width: 100%;
        overflow-x: auto;
      }
    
      .spreadsheet-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }
    
      .spreadsheet-table th {
        text-align: left;
        padding: 16px;
        color: #6b7280;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #e5e7eb;
      }
    
      .spreadsheet-table td {
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
      }
    
      .spreadsheet-input {
        width: 100%;
        border: 1px solid transparent;
        background: transparent;
        padding: 8px;
        font-size: 16px;
        border-radius: 6px;
        font-weight: 500;
      }
    
      .spreadsheet-input:focus {
        background: white;
        border: 1px solid #0052cc;
        outline: none;
      }
    
      /* Auto-calculated field styling */
      .calc-field {
        color: #10b981;
        font-weight: 700;
        background: transparent !important;
      }
    </style>
    
    <div class="lottery-workspace">
      <!-- 1. Live Active Cards (Metrics) -->
      <div class="metrics-grid">
        <div class="glass-card">
          <div style="color: #6b7280; font-size: 14px; font-weight: 600;">TODAY'S DISPATCH</div>
          <div class="metric-value" id="val-dispatch">0</div>
        </div>
        <div class="glass-card">
          <div style="color: #6b7280; font-size: 14px; font-weight: 600;">TOTAL RETURN</div>
          <div class="metric-value" id="val-return" style="color: #ef4444;">0</div>
        </div>
        <div class="glass-card">
          <div style="color: #6b7280; font-size: 14px; font-weight: 600;">NET SALES</div>
          <div class="metric-value" id="val-net">₹ 0.00</div>
        </div>
        <div class="glass-card">
          <div style="color: #6b7280; font-size: 14px; font-weight: 600;">LIVE OUTSTANDING</div>
          <div class="metric-value" id="val-outstanding" style="color: #f59e0b;">₹ 0.00</div>
        </div>
      </div>
    
      <!-- 2. Party Search (ORB-ID Integration) -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <div class="party-search-section">
          <input type="tel" class="glass-input" placeholder="🔍 Enter Mobile Number to Search or Create Party..." id="party-mobile-input">
          <button class="btn-primary" id="btn-fetch-party">Load Ledger</button>
        </div>
        <div id="party-info-display" style="display: none; color: #059669; font-weight: 600;">
          ✓ Party Loaded: <span id="active-party-name">Stockist A</span>
        </div>
      </div>
    
      <!-- 3. Spreadsheet Workspace -->
      <div class="glass-card">
        <div class="spreadsheet-container">
          <table class="spreadsheet-table">
            <thead>
              <tr>
                <th>Ticket Name</th>
                <th>Rate (₹)</th>
                <th>Dispatch Qty</th>
                <th>Return Qty</th>
                <th>Comm. (%)</th>
                <th>Net Pay (Auto)</th>
              </tr>
            </thead>
            <tbody id="lottery-grid-body">
              <tr>
                <td><input type="text" class="spreadsheet-input" placeholder="e.g. Morning Star"></td>
                <td><input type="number" class="spreadsheet-input rate-input" placeholder="0.00"></td>
                <td><input type="number" class="spreadsheet-input dispatch-input" placeholder="0"></td>
                <td><input type="number" class="spreadsheet-input return-input" placeholder="0"></td>
                <td><input type="number" class="spreadsheet-input comm-input" placeholder="0%"></td>
                <td><input type="text" class="spreadsheet-input calc-field net-pay-output" readonly value="₹ 0.00"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `;
}
