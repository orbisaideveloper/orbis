# DL-005 — Dispatch, Return & Commission Workflow

**Project:** ORBIS

**Module:** DigiLedger

**Business Profile:** Lottery

**Document ID:** DL-005

**Version:** 1.0

**Status:** Draft for Approval

---

# Purpose

This document defines the complete daily business workflow of the Lottery module.

The workflow is optimized for speed, minimum data entry and automatic accounting.

---

# Vision

The operator should only enter business values.

ORBIS automatically performs all calculations, updates ledgers, statements, reports and outstanding balances.

---

# Daily Workflow

Business Date

↓

Select Party Type

↓

Select Party

↓

Dispatch Entry

↓

Return Entry

↓

Automatic Calculation

↓

Draft Auto Save

↓

Settlement

↓

Reports

---

# Entry Interface

The entire daily entry screen follows a spreadsheet/table layout.

Columns:

Party Name

Dispatch

Return

Net Tickets

Net Amount

Commission %

Commission Amount

TDS

Final Amount

Opening Outstanding

Current Outstanding

Status

No multiple forms.

No repeated entry.

---

# User Input

The operator only enters:

- Dispatch Quantity
- Return Quantity

Optional:

- Commission Override (if permitted)

Everything else is calculated automatically.

---

# Automatic Calculations

ORBIS calculates:

- Net Tickets
- Net Sale
- Sale Amount
- Commission
- TDS
- Final Payable
- Outstanding
- Ledger
- Statement

No manual calculations are permitted.

---

# Dispatch Rules

Dispatch increases inventory issued to the selected party.

Every dispatch immediately creates:

- Dispatch Record
- Inventory Update
- Ledger Entry
- Audit Entry

---

# Return Rules

Returns automatically:

- Reduce Net Tickets
- Adjust Inventory
- Update Ledger
- Update Outstanding

---

# Commission Engine

Each party has a default commission.

The commission is automatically applied.

Admins may allow manual override if required.

---

# TDS Engine

The TDS percentage is configured globally in Admin Settings.

Example:

TDS = 2%

Workflow:

Commission

↓

TDS Deduction

↓

Final Commission

↓

Ledger Entry

↓

TDS Register

Users never calculate TDS manually.

---

# Outstanding Engine

Opening Outstanding is automatically retrieved.

Current Bill is added.

Payments are deducted separately.

Closing Outstanding is updated automatically.

---

# Payment Separation

Dispatch and Settlement are different processes.

Business Entry Screen never receives payment.

Payments are recorded only inside the Settlement Workspace.

---

# Auto Draft Save

Every modification is automatically saved locally.

If the application closes unexpectedly:

Reopen

↓

Restore Draft

↓

Continue Entry

No information should be lost.

---

# Barcode Integration

Lottery books support barcode scanning.

Scanning automatically captures:

- Series
- Book Number
- Ticket Count
- Amount
- Dispatch Reference

Manual entry remains available.

---

# Winning Ticket

Winning tickets support barcode scanning.

ORBIS automatically updates:

- Prize
- Settlement
- Ledger
- Customer Statement

---

# Navigation

Summary

↓

Party List

↓

Party Profile

↓

Statement

↓

Ledger

↓

Transaction

↓

Audit

Every transaction remains fully traceable.

---

# Reports Updated Automatically

Every saved transaction updates:

- Customer Statement
- Supplier Statement
- Ledger
- Outstanding
- Cash Book
- Bank Book
- Daily Report
- Monthly Report
- PDF
- Excel
- CSV

No manual report generation is required.

---

# Design Principles

Spreadsheet First

Zero Duplicate Entry

Automatic Accounting

Fast Business Entry

Complete Traceability

Offline First

Future Ready

---

# Foundation Rule

The Lottery Workflow must remain independent from the accounting engine.

Business logic may evolve.

The ORBIS Accounting Foundation must remain unchanged.

---

# Next Document

DL-006 — Payment, Cash, Bank & Financial Reconciliation