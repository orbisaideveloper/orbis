# AC-003 — Universal Payment Engine

**Project:** ORBIS

**Layer:** Modules → Accounting

**Document ID:** AC-003

**Version:** 1.0

**Status:** Draft for Approval

---

# Purpose

This document defines the Universal Payment Engine used by all ORBIS business modules.

The objective is to establish one shared payment system that can be reused across DigiLedger, Farmer Brain, Dairy, Grocery and all future business modules.

---

# Vision

One Payment Engine.

Unlimited Business Modules.

Every financial transaction in ORBIS must pass through the same payment engine.

Business workflows may differ.

Accounting workflow remains the same.

---

# Universal Transaction Types

The platform supports the following transaction types:

- Purchase
- Sale
- Payment In
- Payment Out
- Expense
- Return
- Adjustment

No module may introduce a separate payment mechanism.

---

# Universal Payment Flow

Every payment follows the same workflow.

Business Event

↓

Payment Engine

↓

Ledger Entry

↓

Account Balance

↓

Reports

↓

Backup

---

# Payment In

Payment In represents money received.

Examples:

- Customer Payment
- Advance Received
- Refund Received
- Income

Payment In always increases available balance.

---

# Payment Out

Payment Out represents money paid.

Examples:

- Supplier Payment
- Purchase Payment
- Salary
- Utility Bills
- Miscellaneous Expenses

Payment Out always reduces available balance.

---

# Expense Rule

Every Expense is internally processed as a Payment Out.

Workflow

Expense

↓

Payment Out

↓

Ledger

↓

Reports

This keeps the accounting system simple and consistent.

---

# Purchase Workflow

Purchase

↓

Supplier

↓

Inventory Update

↓

Payment Engine

↓

Ledger

↓

Reports

---

# Sales Workflow

Sale

↓

Customer

↓

Inventory Update

↓

Payment Engine

↓

Ledger

↓

Reports

---

# Return Workflow

Returns always adjust:

- Inventory
- Ledger
- Outstanding Balance

The Payment Engine determines whether money should be refunded or adjusted.

---

# Outstanding Balance

Every customer and supplier maintains an outstanding balance.

Outstanding is automatically updated after every transaction.

Manual balance editing is not permitted.

---

# Universal Ledger Rule

Every payment creates a ledger entry.

No financial transaction may bypass the ledger.

The ledger is the single source of financial truth.

---

# Reporting Integration

The Payment Engine automatically supplies data to:

- Statement
- Ledger
- Cash Book
- Balance Summary
- Daily Report
- Monthly Report
- PDF Export
- Excel Export
- CSV Export

---

# Audit Trail

Every payment records:

- ORB-ID
- User
- Module
- Transaction Type
- Timestamp
- Device
- Reference Number

Audit records are immutable.

---

# Design Principles

One Payment Engine

One Ledger

One Balance

One Audit Trail

Reusable Across All Modules

---

# Out of Scope

Business-specific payment rules are documented inside individual modules such as DigiLedger Lottery or Farmer Brain.

This document defines only the shared payment standard.

---

# Next Document

AC-004 — Reporting Standard