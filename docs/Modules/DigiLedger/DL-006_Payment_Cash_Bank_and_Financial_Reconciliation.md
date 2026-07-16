# DL-006 — Payment, Cash, Bank & Financial Reconciliation

**Project:** ORBIS

**Module:** DigiLedger

**Business Profile:** Lottery

**Document ID:** DL-006

**Version:** 1.0

**Status:** Draft for Approval

---

# Purpose

This document defines the complete financial settlement, payment, cash, bank and reconciliation workflow for the Lottery business profile.

The workflow follows the ORBIS Universal Accounting Foundation while providing a fast, reliable and traceable payment system.

---

# Vision

One Payment Engine.

One Cash Book.

One Bank Book.

One Financial Truth.

Every financial movement must pass through a single reconciliation engine.

---

# Payment Philosophy

Business Entry and Payment Entry are always separate.

Business operations create outstanding balances.

Payments settle those balances.

---

# Supported Payment Methods

The payment engine supports:

- Cash
- Bank Transfer
- UPI
- Cheque
- Prize Adjustment
- Credit Adjustment
- Future Digital Payment Methods

Every payment method follows the same accounting workflow.

---

# Payment Workspace

Each payment contains:

- Party Name
- ORB-ID
- Payment Date
- Payment Period (From - To)
- Opening Outstanding
- Current Bill
- Previous Adjustments
- Amount Received
- Closing Outstanding
- Payment Method
- Reference Number
- Notes

---

# Payment Workflow

Select Party

↓

Retrieve Live Outstanding

↓

Select Payment Period

↓

Enter Amount

↓

Select Payment Method

↓

Automatic Ledger Update

↓

Automatic Statement Update

↓

Outstanding Updated

↓

Cash / Bank Updated

↓

Audit Created

---

# Payment Period Rule

Every payment must reference a business period.

Example:

From: 03-Jul-2026

To: 07-Jul-2026

This enables complete financial traceability.

---

# Cash Ledger

Cash transactions automatically update:

- Cash Balance
- Daily Cash Book
- Cash Statement
- Cash Audit

Cash balance is always visible on the Dashboard.

---

# Bank Ledger

Bank transactions automatically update:

- Bank Ledger
- Bank Statement
- Bank Balance
- Bank Audit

The system stores accounting balances only.

It never performs banking operations.

---

# UPI Ledger

UPI payments behave like bank transactions.

Each transaction stores:

- UPI Reference Number
- Payment App
- Transaction Time
- Amount
- Status

---

# Cheque Management

Cheque entries include:

- Cheque Number
- Bank Name
- Deposit Date
- Clearance Status
- Bounce Status

---

# Prize Adjustment

Winning prize settlements may reduce outstanding balances automatically.

Prize adjustments always create ledger entries.

---

# Financial Reconciliation

ORBIS continuously compares:

Cash Book

↓

Bank Book

↓

Ledger

↓

Outstanding

↓

Statements

↓

Reports

Differences are automatically highlighted for review.

---

# Dashboard Summary

The payment dashboard displays:

- Cash Balance
- Bank Balance
- Total Collections
- Total Outstanding
- Today's Collections
- Pending Settlements
- Payment Alerts

Selecting any value opens the detailed ledger.

---

# Auto Synchronization

Every payment automatically updates:

- Customer Statement
- Supplier Statement
- Party Ledger
- Cash Book
- Bank Book
- Outstanding
- Reports
- Audit Trail

No duplicate entry is required.

---

# Security Rules

Every payment requires:

- ORB-ID
- Timestamp
- Device ID
- User ID
- Audit Reference

Financial records cannot be permanently deleted.

---

# Design Principles

One Payment Engine

One Financial Ledger

Automatic Reconciliation

Real-Time Balance

Complete Traceability

Offline First

Future Scalable

---

# Foundation Rule

Every DigiLedger business profile must use the same Payment and Reconciliation Engine.

Business workflows may differ.

Financial integrity must remain common across the ORBIS Platform.

---

# Next Document

DL-007 — Reports, Dashboard & Business Intelligence