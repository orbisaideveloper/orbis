# AC-002 — Core Business Entities

**Project:** ORBIS  
**Layer:** Modules → Accounting  
**Document ID:** AC-002  
**Version:** 1.0  
**Status:** Draft for Approval

---

# Purpose

This document defines the universal business entities used by the ORBIS Accounting Foundation.

These entities are shared across every accounting-enabled module, including DigiLedger, Farmer Brain, and future ORBIS business modules.

Business workflows may differ, but the core entities remain consistent.

---

# Design Philosophy

Every business can be represented using a small set of standard entities.

Instead of creating different structures for each module, ORBIS uses one unified accounting model.

This reduces complexity and improves maintainability.

---

# Core Business Entities

## 1. Business Owner

The authenticated ORBIS user operating the business.

Responsibilities:

- Owns business data
- Controls modules
- Manages permissions
- Receives reports

---

## 2. Supplier

Represents any individual or organization from whom goods or services are purchased.

Examples:

- Lottery Stockist
- Feed Supplier
- Medicine Supplier
- Equipment Vendor

Common Information:

- Name
- Mobile Number
- ORB-ID (if registered)
- Address
- Notes

---

## 3. Customer

Represents any individual or organization receiving products or services.

Examples:

- Lottery Agent
- Milk Customer
- Retail Customer

Common Information:

- Name
- Mobile Number
- ORB-ID (if registered)
- Address
- Notes

---

## 4. Product / Service

Represents any item that can be purchased, stocked or sold.

Examples:

- Lottery Books
- Milk
- Animal Feed
- Seeds
- Fertilizer

Every product must support inventory tracking where applicable.

---

## 5. Transaction

Every financial activity is treated as a transaction.

Transaction Types include:

- Purchase
- Sale
- Payment In
- Payment Out
- Expense
- Return
- Stock Adjustment

Every transaction creates a ledger entry.

---

# Universal Identity Rule

If a Supplier or Customer is already registered with an ORBIS Identity (ORB-ID), that identity should be reused.

Otherwise, the accounting module creates a local business record, which can later be linked to an ORB-ID.

This allows users to join ORBIS without losing historical business records.

---

# Entity Relationships

Business Owner

↓

Supplier ← Purchase

↓

Inventory

↓

Customer ← Sale

↓

Payment

↓

Ledger

↓

Reports

---

# Design Principles

- One customer structure
- One supplier structure
- One transaction model
- One identity system
- One ledger standard
- Shared across all ORBIS modules

---

# Out of Scope

This document does not define:

- Payment workflows
- Report generation
- Backup strategy
- Business-specific logic

These are covered in subsequent accounting documents.

---

# Next Document

AC-003 — Universal Payment Engine