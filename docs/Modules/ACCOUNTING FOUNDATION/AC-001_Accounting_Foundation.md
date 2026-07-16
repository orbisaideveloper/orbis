# AC-001 — Universal Accounting Foundation

**Project:** ORBIS  
**Layer:** Business Foundation  
**Module:** Shared Accounting Core  
**Document ID:** AC-001  
**Version:** 1.0  
**Status:** Draft for Approval  
**Created:** 2026-07-16 (UTC)  

---

# Purpose

This document defines the Universal Accounting Foundation of the ORBIS Platform.

It is not specific to DigiLedger, Farmer Brain, Lottery, Dairy, Grocery, or any other business module.

Instead, it establishes one common accounting standard that every ORBIS business module must follow.

The objective is:

> Build the accounting engine once and reuse it everywhere.

---

# Vision

Every ORBIS business module should use the same accounting principles.

Business logic may change.

Accounting logic must remain consistent.

This ensures:

- Simple learning for users.
- Shared reporting standards.
- Easier maintenance.
- Lower development cost.
- Plug-and-Play business modules.

---

# Universal Business Participants

The accounting foundation recognizes only a small set of universal business entities.

## Supplier

Represents the party from whom goods or services are purchased.

Examples:

- Lottery Stockist
- Feed Supplier
- Medicine Supplier
- Equipment Vendor

---

## Customer

Represents the party to whom goods or services are sold.

Examples:

- Lottery Agent
- Milk Customer
- Retail Buyer

---

## Business Owner

Represents the ORBIS account owner operating the business.

---

# Universal Accounting Components

Every business module must use the following shared components.

- Purchase
- Sales
- Payment
- Expense
- Ledger
- Reports
- Backup

No business module should implement its own accounting engine.

---

# Universal Payment Engine

The platform provides one common payment engine.

Supported transaction types:

- Payment In
- Payment Out

Every business module must use this shared payment system.

---

# Expense Rule

Expenses are treated as a specialized form of Payment Out.

Workflow:

Expense

↓

Payment Out

↓

Ledger

↓

Reports

This keeps the accounting model simple and consistent.

---

# Inventory Rule

Inventory changes must always be linked with accounting events.

Purchase increases inventory.

Sales decrease inventory.

Returns adjust inventory.

Inventory and accounting must always remain synchronized.

---

# Universal Ledger

Every financial event creates a ledger record.

Examples:

- Purchase
- Sale
- Expense
- Payment In
- Payment Out
- Inventory Adjustment

The Ledger acts as the single financial source of truth.

---

# Design Principles

The accounting foundation follows these principles:

- Simplicity
- Consistency
- Reusability
- Auditability
- Extensibility
- Module Independence

---

# Scope

This document defines only the shared accounting rules.

Business-specific workflows (such as Lottery or Agriculture) are documented separately.

---

# Next Document

AC-002 — Core Entities