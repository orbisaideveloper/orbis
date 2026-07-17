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
    
      /* Party Search Box (ORB-ID) - For Quick Lookup */
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

      /* Add Row Button */
      .btn-secondary {
        background: rgba(0, 82, 204, 0.1);
        color: #0052cc;
        border: 2px dashed #0052cc;
        padding: 12px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        margin-top: 12px;
        transition: all 0.2s;
      }
      .btn-secondary:hover {
        background: rgba(0, 82, 204, 0.2);
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
        min-width: 1200px; /* Ensure horizontal scroll for many columns */
      }
    
      .spreadsheet-table th {
        text-align: left;
        padding: 14px 10px;
        color: #6b7280;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 2px solid #e5e7eb;
        white-space: nowrap;
      }
    
      .spreadsheet-table td {
        padding: 8px;
        border-bottom: 1px solid #f3f4f6;
      }
    
      .spreadsheet-input {
        width: 100%;
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.5);
        padding: 10px;
        font-size: 15px;
        border-radius: 6px;
        font-weight: 500;
        transition: all 0.2s;
      }
    
      .spreadsheet-input:focus {
        background: white;
        border: 1px solid #0052cc;
        outline: none;
        box-shadow: 0 0 5px rgba(0, 82, 204, 0.2);
      }
    
      /* Auto-calculated field styling */
      .calc-field {
        font-weight: 700;
        background: transparent !important;
        pointer-events: none; /* Prevents manual typing */
      }
      .text-success { color: #10b981; }
      .text-warning { color: #f59e0b; }
      
      /* Negative value warning */
      .negative-val {
        color: #ef4444 !important; /* Red */
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
    
      <!-- 2. Party Lookup (Optional for single check) -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <div class="party-search-section">
          <input type="tel" class="glass-input" placeholder="🔍 Quick Lookup: Mobile Number / ORB-ID..." id="party-mobile-input">
          <button class="btn-primary" id="btn-fetch-party">Check Profile</button>
        </div>
      </div>
    
      <!-- 3. Spreadsheet Workspace (BULK ENTRY) -->
      <div class="glass-card">
        <div class="spreadsheet-container">
          <table class="spreadsheet-table">
            <thead>
              <tr>
                <th style="width: 15%">Party Name</th>
                <th style="width: 8%">Rate (₹)</th>
                <th style="width: 9%">Dispatch</th>
                <th style="width: 9%">Return</th>
                <th style="width: 9%">Net Tkt</th>
                <th style="width: 8%">Comm (%)</th>
                <th style="width: 8%">TDS (%)</th>
                <th style="width: 11%">Net Pay</th>
                <th style="width: 11%">Prev Bal</th>
                <th style="width: 12%">Curr Bal</th>
              </tr>
            </thead>
            <tbody id="lottery-grid-body">
              <!-- Row 1 -->
              <tr>
                <td><input type="text" class="spreadsheet-input party-input" placeholder="Search/Select Party"></td>
                <td><input type="number" class="spreadsheet-input rate-input" placeholder="0"></td>
                <td><input type="number" class="spreadsheet-input dispatch-input" placeholder="0"></td>
                <td><input type="number" class="spreadsheet-input return-input" placeholder="0"></td>
                <td><input type="text" class="spreadsheet-input calc-field net-tkt-output" readonly value="0"></td>
                <td><input type="number" class="spreadsheet-input comm-input" placeholder="0"></td>
                <td><input type="number" class="spreadsheet-input tds-input" placeholder="0"></td>
                <td><input type="text" class="spreadsheet-input calc-field net-pay-output text-success" readonly value="₹ 0.00"></td>
                <td><input type="number" class="spreadsheet-input prev-bal-input" placeholder="0.00"></td>
                <td><input type="text" class="spreadsheet-input calc-field curr-bal-output text-warning" readonly value="₹ 0.00"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn-secondary" id="btn-add-row">+ Add More Party</button>
      </div>
    </div>
    `;
}
