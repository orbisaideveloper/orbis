# ORBIS DEVELOPMENT WORKFLOW

> Official Development Process & AI Build Workflow

---

# Document Information

Document Name : Development Workflow

Document ID : ORB-DOC-006

Version : 1.0

Status : Draft

Project : Orbis

Type : Development Workflow

---

# Document Scope

This document defines the complete software development process inside the Orbis platform.

It explains how requirements are transformed into production-ready software.

This document does NOT define:

• User Workflow

• System Architecture

• Database Design

• API Specifications

• Security Policies

Those topics are documented separately.

---

# Purpose

The purpose of this document is to establish a consistent, repeatable and AI-assisted development workflow.

Every software project should follow the same lifecycle regardless of the AI provider or development tools being used.

---

# Development Lifecycle

Requirement

↓

Documentation

↓

Project Planning

↓

Repository Preparation

↓

AI Development

↓

Build

↓

Preview

↓

Review

↓

Revision

↓

Approval

↓

Deployment

↓

Maintenance

---

# Requirement Analysis

Understand business requirements.

Clarify missing information.

Approve requirements before implementation.

---

# Documentation First

Documentation must be completed before code generation begins.

GitHub remains the official source of project documentation.

---

# Repository Workflow

Each software project has its own GitHub repository.

Documentation is committed before implementation.

Source code follows the approved documentation.

---

# AI Development Workflow

Orbis coordinates the complete development process.

AI Builders generate implementation based on approved documentation.

Development may use one or multiple AI providers.

---

# Build Workflow

Generate Build

↓

Automatic Validation

↓

Preview Generation

↓

Review

---

# Live Preview Workflow

Every build should generate a preview whenever possible.

Users review the preview before approving implementation.

---

# Review Workflow

Review functionality.

Review documentation.

Review user experience.

Fix issues if required.

Repeat until approved.

---

# Deployment Workflow

Deployment begins only after user approval.

Approved builds are published through the deployment platform.

---

# Human Approval Rules

Major architectural changes require approval.

Production deployment requires approval.

Critical business logic changes require approval.

---

# Development Principles

Documentation First

GitHub First

Preview Before Deployment

Human Approval

Incremental Development

Provider Independence

---

# Workflow Rules

Never implement undocumented features.

Never bypass documentation.

Every change should be traceable.

Every project should maintain version history.

---

# Relationship to Other Documents

Project Workflow → 05_USER_WORKFLOW.md

AI Providers → 08_AI_PROVIDER_MANAGEMENT.md

Deployment → 13_DEPLOYMENT.md

Admin & Audit → 14_ADMIN_AUDIT_CENTER.md

---

End of Document
