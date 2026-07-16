# DL-002 — Lottery Vision and Business Architecture

**Project:** ORBIS

**Module:** DigiLedger

**Business Profile:** Lottery

**Document ID:** DL-002

**Version:** 1.0

**Status:** Draft for Approval

---

# Purpose

This document defines the business structure, participant hierarchy and operational workflow of the Lottery business profile within DigiLedger.

This document describes business operations only.

Accounting rules are inherited from the ORBIS Accounting Foundation.

---

# Vision

The Lottery profile is designed to manage the complete lottery distribution chain using a simple, fast and mobile-first workflow.

Every participant in the supply chain is managed using one common accounting engine.

---

# Business Distribution Chain

Lottery business follows the following hierarchy.

Lottery Company

↓

Stockist

↓

Service Stockist

↓

Seller

↓

Customer

---

# DigiLedger Scope

The Lottery Company remains outside the daily operational workflow.

The platform begins from the Stockist level.

Therefore DigiLedger manages:

- Stockist
- Service Stockist
- Seller
- Customer

---

# Business Participants

## Stockist

Primary supplier of lottery books.

Responsible for supplying Service Stockists.

---

## Service Stockist

Acts as the distributor.

Purchases from Stockists.

Supplies Sellers.

---

## Seller

Purchases lottery books.

Sells directly to Customers.

Handles dispatch, returns and payments.

---

## Customer

Final buyer of lottery tickets.

Customers do not manage inventory.

Customers may access their own ORBIS Customer View to view statements, payment history and future services.

---

# Party Management

Every business participant is managed as a Party Profile.

Party Types include:

- Stockist
- Service Stockist
- Seller
- Customer

Every Party Profile supports:

- Add Profile
- Edit Profile
- Archive Profile
- View Statement
- Transaction History

---

# Universal Add Profile

Every participant list includes an Add Profile action.

Users may create new:

- Stockists
- Service Stockists
- Sellers
- Customers

at any time.

The platform automatically creates or links the ORB-ID whenever possible.

---

# Credit and Debit Parties

Every Party may act as:

- Credit Party
- Debit Party

depending on the business transaction.

The accounting engine automatically determines balances.

Separate accounting systems are never created.

---

# Purchase Flow

Purchase always starts from:

Stockist

↓

Service Stockist

↓

Seller

Inventory updates automatically after every purchase.

---

# Sales Flow

Seller

↓

Customer

↓

Payment

↓

Ledger

↓

Reports

---

# Identity Integration

Every Party Profile supports:

- Mobile Number
- Name
- Address
- ORB-ID (if available)

Existing ORB-ID records are reused.

Otherwise a Placeholder Identity is created.

---

# Design Principles

Simple

Fast

Mobile First

Offline First

Minimal Data Entry

Shared Accounting Engine

Reusable Profiles

---

# Out of Scope

This document does not define:

- Dispatch workflow
- Return workflow
- Commission calculation
- Reporting

These are covered in subsequent DigiLedger Lottery documents.

---

# Next Document

DL-003 — Party Management & Customer Workspace