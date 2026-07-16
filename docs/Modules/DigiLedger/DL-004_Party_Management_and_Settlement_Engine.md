# DL-004 — Party Management & Settlement Engine

**Project:** ORBIS

**Module:** DigiLedger

**Business Profile:** Lottery

**Document ID:** DL-004

**Version:** 1.0

**Status:** Draft for Approval

---

# Purpose

This document defines the Party Management System and Settlement Engine for the Lottery business profile.

Every financial relationship inside the Lottery module is managed through standardized Party Profiles and the Universal Settlement Engine.

---

# Vision

One Party.

One Identity.

Unlimited Business Relationships.

Every person or organization exists only once in ORBIS.

The same ORB-ID may participate in multiple modules with different business roles.

---

# Party Types

Lottery supports the following party roles:

- Stockist
- Service Stockist
- Seller
- Customer

A single ORB-ID may have multiple roles.

Example:

Seller in Lottery

↓

Customer in Grocery

↓

Supplier in Farmer Brain

↓

Personal User in ORBIS

---

# Party Profile

Every Party contains:

- ORB-ID
- Name
- Mobile Number
- Address
- Role(s)
- Default Commission
- Default Rate
- Default Payment Preference
- Status
- Created Date
- Last Activity

---

# Smart Party Creation

When creating a new Party:

Mobile Number

↓

Search Existing ORB-ID

↓

If Found

Reuse Existing Profile

↓

If Not Found

Create Placeholder Identity

↓

Auto Link Later

---

# Universal Party Workspace

Every Party opens the same workspace.

Profile

↓

Summary

↓

Statement

↓

Ledger

↓

Dispatch

↓

Returns

↓

Payments

↓

Outstanding

↓

Reports

↓

Audit

---

# Outstanding Summary

The workspace initially displays only summary values.

Example:

Outstanding

₹4,850

Selecting Outstanding opens:

Party List

↓

Party Profile

↓

Complete Ledger

↓

Transaction History

No duplicate information is displayed.

---

# Settlement Engine

Settlement is completely independent from Dispatch.

Dispatch creates business.

Settlement clears business.

---

# Settlement Workflow

Opening Outstanding

↓

Current Business

↓

Commission

↓

TDS

↓

Final Payable

↓

Payment Received

↓

Closing Outstanding

Everything is calculated automatically.

---

# Payment Period

Every settlement records:

- From Date
- To Date
- Payment Date
- Opening Outstanding
- Current Transactions
- Closing Outstanding

This enables complete audit tracking.

---

# Multiple Payments

A party may complete payments in multiple installments.

Each installment updates:

- Ledger
- Statement
- Outstanding
- Cash
- Bank
- Audit

No manual adjustment is required.

---

# Settlement Methods

Supported methods:

- Cash
- Bank Transfer
- UPI
- Cheque
- Winning Prize Adjustment

Future methods may be added without changing the accounting engine.

---

# Settlement Notes

Every settlement may contain:

- Remarks
- Adjustment Reason
- Reference Number
- Attachment
- Supporting Documents

---

# Navigation Standard

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

Every amount inside ORBIS must be traceable.

---

# Design Principles

Single Identity

Single Party Profile

Automatic Settlement

Zero Duplicate Entry

Complete Traceability

Audit Ready

Future Scalable

---

# Foundation Rule

Party Management is shared by all DigiLedger business profiles.

Only business workflows change.

The identity, ledger and settlement engine remain common.

---

# Next Document

DL-005 — Dispatch, Return & Commission Workflow