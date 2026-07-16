# DL-003 — Lottery Workspace & Transaction Workflow

Project: ORBIS

Module: DigiLedger

Business Profile: Lottery

Document ID: DL-003

Version: 1.0

Status: Draft for Approval

---

# Purpose

This document defines the operational workspace and transaction workflow for the Lottery business profile.

The design focuses on minimum user input and maximum automatic calculation.

---

# Golden Principle

The user enters business data.

ORBIS performs all calculations automatically.

---

# Workspace Philosophy

The Lottery Workspace is designed as a spreadsheet-style table.

Users should never navigate through multiple forms for daily entry.

---

# Seller Workspace Layout

Columns:

Seller

Dispatch

Return

Net Tickets

Net Amount

Commission

Final Amount

Opening Outstanding

Current Outstanding

Status

Only Dispatch, Return and (if required) Commission are entered manually.

Everything else is calculated automatically.

---

# Auto Calculation

System automatically calculates:

- Net Tickets
- Net Sales
- Commission Amount
- TDS
- Final Payable
- Outstanding
- Ledger
- Statement

---

# Opening Outstanding

Whenever a business date is selected,

ORBIS automatically retrieves the previous outstanding balance.

Users never enter opening balances manually.

---

# Payment Separation

Dispatch and Payment are independent workflows.

Dispatch happens once.

Payments may occur throughout the day.

Therefore Payment has its own dedicated workspace.

---

# Payment Workspace

Every payment contains:

Payment Date

Payment Period

Opening Outstanding

Current Bill

Received Amount

Closing Outstanding

Notes

---

# Payment Period

Every payment must reference a business period.

Example:

03-Jul-2026

↓

07-Jul-2026

This allows complete financial traceability.

---

# Outstanding Navigation

Summary

↓

Party List

↓

Party Profile

↓

Ledger

↓

Transaction

↓

Audit

Users can drill down to the original transaction.

---

# Party Profile

Each party profile contains:

Profile

Statement

Ledger

Outstanding

Payment History

Dispatch History

Return History

Reports

Audit

---

# Barcode Support

Lottery books support barcode scanning.

Scanning automatically fills:

Series

Book Number

Ticket Count

Amount

Dispatch Information

Manual entry remains available.

---

# Winning Ticket

Winning tickets may also be scanned.

ORBIS automatically updates:

Prize

Settlement

Ledger

Statement

---

# Auto Draft

Every entry is automatically saved as a draft.

If the application closes unexpectedly,

the workspace resumes exactly where the user stopped.

---

# No Duplicate Information

The same financial information must never appear multiple times on one screen.

Summary leads to Details.

Details lead to Ledger.

Ledger leads to Transaction.

---

# Design Principles

Spreadsheet Style

Fast Entry

Automatic Calculation

Minimal Typing

Maximum Accuracy

Full Traceability

---

# Next Document

DL-004 — Lottery Party Management & Settlement Engine