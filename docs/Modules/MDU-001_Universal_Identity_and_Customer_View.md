# MDU-001 — Universal Identity and Customer View

**Project:** ORBIS

**Layer:** Modules

**Document ID:** MDU-001

**Version:** 1.0

**Status:** Draft for Approval

---

# Purpose

This document defines the Universal Identity System used across all ORBIS business modules.

Every person interacting with ORBIS should have only one digital identity.

Regardless of which module they use, the same identity should be recognized everywhere.

---

# Vision

One Person.

One Identity.

Unlimited Modules.

Users should never create separate identities for Lottery, Farmer Brain, Dairy, Accounting or future modules.

One ORB-ID represents one person throughout the ORBIS Platform.

---

# Universal ORB Identity

Every ORBIS user receives one permanent ORB-ID.

Example

ORB-7F4A-2026

The ORB-ID never changes.

Even if the user changes

- Mobile Number
- Email
- Device
- Business
- Address

the ORB-ID remains the same.

---

# Identity Creation

A permanent ORB-ID is generated when:

- A user signs into ORBIS.
- A business owner creates a customer profile.
- A supplier profile is created.

If the person is not yet an ORBIS user,

a Placeholder Identity is created.

When that person later joins ORBIS,

the Placeholder Identity merges into the real ORB-ID.

No business history is lost.

---

# Mobile Number

The mobile number is used only for

Identity Discovery

and

Identity Verification.

It is NOT the permanent identity.

The permanent identity is always the ORB-ID.

---

# Contact Integration

Business modules should support importing contacts from the user's device.

Typical workflow:

Contact Selected

↓

Name Imported

↓

Mobile Imported

↓

Customer Created

↓

ORB Identity Linked

---

# Customer View

Every ORB-ID automatically receives a Customer Workspace.

Inside Customer View users can access:

- Profile
- Statements
- Payment History
- Outstanding Balance
- Business Relationships
- Notifications
- AI Assistant

Users cannot access business owner data.

They can only view their own records.

---

# Cross Module Experience

The same ORB-ID works across:

- DigiLedger
- Farmer Brain
- Dairy
- Future Modules

A customer joining another module should never register again.

The same identity follows the user.

---

# Security Principles

Every ORB-ID belongs to exactly one person.

Business Owners cannot modify ORB-IDs.

Only platform identity services manage ORB-IDs.

---

# Design Principles

One Identity

One Customer View

One Platform

Unlimited Modules

---

# Next Document

M-011 Storage and Backup Architecture