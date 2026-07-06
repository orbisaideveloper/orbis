# ORBIS Master Database Schema

**Document No:** 21  
**Version:** 1.0  
**Status:** Database Foundation  
**Project:** ORBIS Platform

---

# PART 1 — Database Foundation & Philosophy

## Purpose

This document defines the permanent database foundation of the ORBIS Platform.

Every business module, API, AI service, and future integration must use this database architecture.

The database is the single source of truth for all ORBIS business data.

---

# Database Golden Rule

> **One Platform. One Shared Database. Unlimited Business Modules.**
>
> The database must support current and future business modules without requiring structural redesign.
>
> Data integrity, scalability, security, and maintainability always take priority over convenience.

---

# Database Architecture

```text
                    ORBIS PLATFORM
                           │
                           ▼

                MASTER DATABASE PLATFORM

 ┌──────────────────────────────────────────────┐
 │                                              │
 │ Shared Core Tables                           │
 │ Universal Business Tables                    │
 │ Module Extension Tables                      │
 │ Audit & History Tables                       │
 │ AI & Integration Tables                      │
 │                                              │
 └──────────────────────────────────────────────┘
                           │
                           ▼

      Lottery      Dairy      Grocery
      CRM          Pharmacy   Agriculture
      Hospital     School     Manufacturing
      Future Business Modules
```

---

# Database Philosophy

The ORBIS database is designed to remain stable while business modules continue to evolve.

Business rules may change.

Business modules may grow.

The database foundation must remain consistent.

---

# Universal Database Standards

Every table must follow the same platform standards.

Minimum requirements:

- UUID Primary Key
- Organization ID
- Branch ID (when applicable)
- Created By
- Updated By
- Created At
- Updated At
- Soft Delete Support
- Audit Support

No exception is allowed without architectural approval.

---

# Database Naming Convention

Tables:

- snake_case
- plural table names

Columns:

- snake_case
- descriptive names
- consistent naming across modules

Primary Key:

- id (UUID)

Foreign Keys:

- organization_id
- branch_id
- customer_id
- supplier_id
- product_id

---

# Shared Database Principles

The Shared Core Database belongs to the platform.

Business modules extend the database.

Business modules must never duplicate shared data.

Shared tables must remain reusable across all modules.

---

# Database Objectives

The database must always be:

- Secure
- Scalable
- Modular
- AI Ready
- API Ready
- Offline Ready
- Multi Organization Ready
- Multi Branch Ready
- Enterprise Ready

---

# Database Golden Principles

- One Source of Truth
- Zero Data Loss
- Reuse Before Create
- Shared Core First
- Modular Expansion
- Audit Everything
- Security First
- Documentation First

---

# End of Part 1

---
