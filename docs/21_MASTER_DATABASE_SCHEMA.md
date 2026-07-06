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
---

# PART 2 — Shared Core Database Schema

## Purpose

The Shared Core Database is the permanent foundation of the ORBIS Platform.

Every current and future business module must use these shared tables.

Business modules may extend the database but must never duplicate the Shared Core.

---

# Shared Core Database Architecture

```text
                  SHARED CORE DATABASE

                         │
 ┌───────────────────────┼────────────────────────┐
 │                       │                        │
 ▼                       ▼                        ▼

Organizations         Users                 Roles

Branches              Permissions           Sessions

Settings              Notifications         Files

Audit Logs            AI Logs               API Keys

System Config         Activity Logs         Integrations
```

---

# Shared Core Tables

The following tables belong to the platform and are shared by every business module.

```text
organizations
branches
users
roles
permissions
user_roles
organization_members
settings
notifications
files
audit_logs
activity_logs
ai_logs
api_keys
integrations
system_config
```

---

# Table Responsibilities

### organizations

Stores every organization registered on the ORBIS Platform.

---

### branches

Supports multiple branches under a single organization.

---

### users

Stores all platform users.

Authentication information is linked to this table.

---

### roles

Defines platform roles.

Examples:

- Super Admin
- Organization Admin
- Manager
- Staff
- Viewer

---

### permissions

Stores reusable permission definitions.

Role-based access control must use this table.

---

### settings

Stores organization and platform settings.

---

### notifications

Stores all user notifications.

Supports push, email, SMS and future notification channels.

---

### files

Stores metadata for uploaded files.

Actual file storage may be handled externally.

---

### audit_logs

Stores every important business event.

Audit records must never be deleted.

---

### activity_logs

Stores user activity for monitoring and troubleshooting.

---

### ai_logs

Stores AI requests, responses and processing history.

---

### api_keys

Stores external provider configuration.

Sensitive values must always remain encrypted.

---

### integrations

Stores third-party integration settings.

Examples:

- OpenAI
- Gemini
- WhatsApp
- Payment Gateway
- Email
- Maps

---

### system_config

Stores platform-wide configuration.

Only platform administrators may modify these records.

---

# Shared Database Rules

Shared Core tables:

- must never be duplicated
- must remain reusable
- must remain backward compatible
- must support future modules

Business modules must reference these tables instead of creating their own copies.

---

# Shared Core Golden Rules

- One Shared Core
- One User System
- One Organization System
- One Permission System
- One Notification System
- One Audit System
- One AI Logging System
- One Integration Layer

---

# End of Part 2

---
---

# PART 3 — Universal Business Database Schema

## Purpose

The Universal Business Database provides reusable business entities for every ORBIS module.

Every current and future business module must build upon these shared business tables.

Business modules may extend these tables but must never duplicate them.

---

# Universal Business Database

```text
              UNIVERSAL BUSINESS DATABASE

                        │
 ┌──────────────────────┼──────────────────────┐
 │                      │                      │
 ▼                      ▼                      ▼

Customers           Suppliers            Products

Categories          Inventory            Warehouses

Stock Movement      Transactions         Payments

Invoices            Ledger              Expenses

Income              Tax                 Documents

Notes               Attachments         Business Events
```

---

# Universal Business Tables

```text
customers
suppliers
products
product_categories
inventory
warehouses
stock_movements
transactions
payments
invoices
ledger_entries
expenses
income
tax_rules
documents
attachments
notes
business_events
```

---

# Table Responsibilities

### customers

Stores all customer information.

Shared across all business modules.

---

### suppliers

Stores supplier information.

Reusable by every module.

---

### products

Stores products, goods and services.

Supports physical and digital items.

---

### product_categories

Organizes products into reusable categories.

---

### inventory

Stores current stock quantity.

Supports multiple warehouses.

---

### warehouses

Stores warehouse information.

Supports multi-location inventory.

---

### stock_movements

Stores every stock transaction.

Examples:

- Purchase
- Sale
- Transfer
- Return
- Damage
- Adjustment

---

### transactions

Stores business transactions.

Acts as the central business transaction table.

---

### payments

Stores all payment records.

Supports:

- Cash
- Bank
- UPI
- Card
- Wallet
- Future payment methods

---

### invoices

Stores invoices generated by every module.

---

### ledger_entries

Stores accounting ledger transactions.

Every financial module must reuse this table.

---

### expenses

Stores operational expenses.

---

### income

Stores income records.

---

### tax_rules

Stores reusable tax configurations.

---

### documents

Stores business documents.

---

### attachments

Stores attachments linked to business records.

---

### notes

Stores reusable notes.

---

### business_events

Stores important business events for automation and analytics.

---

# Relationship Principles

Every business record must belong to:

Organization

↓

Branch

↓

Business Module

↓

Business Record

↓

Audit Log

This relationship must remain consistent across all modules.

---

# Universal Business Rules

Every business table must:

- Support UUID
- Support Organization ID
- Support Audit
- Support Soft Delete
- Support Attachments
- Support Future Expansion

---

# Golden Rules

- One Customer Database
- One Product Database
- One Ledger Database
- One Inventory Database
- One Payment Database
- One Transaction
---

# PART 4 — Database Governance & Future Expansion

## Purpose

This section defines the permanent governance rules of the ORBIS Master Database.

Every current and future database modification must follow these standards.

The database foundation must remain stable while business modules continue to evolve.

---

# Database Relationship Architecture

```text
                    Organization
                          │
                          ▼
                       Branch
                          │
                          ▼
                      Business Module
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
    Customers         Products        Suppliers
        │                 │                 │
        └──────────┬──────┴──────────┬──────┘
                   ▼                 ▼
              Transactions      Inventory
                   │                 │
                   └──────────┬──────┘
                              ▼
                       Ledger Entries
                              │
                              ▼
                         Audit Logs
```

---

# Foreign Key Standards

Every business table should reference shared platform entities whenever applicable.

Common foreign keys include:

- organization_id
- branch_id
- module_id
- customer_id
- supplier_id
- product_id
- transaction_id
- user_id

Relationships must be enforced through database constraints.

---

# Index Strategy

Indexes should be created for:

- Primary Keys
- Foreign Keys
- Frequently searched columns
- Frequently filtered columns
- Frequently sorted columns

Duplicate or unnecessary indexes should be avoided.

---

# Migration Policy

Database changes must always be version controlled.

Every migration must:

- be reversible
- preserve existing data
- avoid breaking existing modules
- include validation before deployment

---

# Module Extension Rules

Every new business module must:

- reuse Shared Core tables
- reuse Universal Business tables
- create only module-specific tables when required
- avoid duplicate structures
- maintain backward compatibility

The Shared Core Database must never be modified
