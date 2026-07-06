# ORBIS USER WORKFLOW

> Official User Experience & Workflow

---

# Document Information

Document Name : User Workflow

Document ID : ORB-DOC-005

Version : 1.0

Status : Draft

Project : Orbis

Type : User Experience

---

# Document Scope

This document defines how users interact with the Orbis platform.

It explains the complete user journey from the first login to software deployment.

This document does NOT define:

• System Architecture

• Database Design

• API Specifications

• Security Implementation

• Deployment Infrastructure

Those topics are documented separately.

---

# Purpose

The goal of this document is to provide a simple, natural and guided experience for every user.

Business users should be able to create software without understanding technical tools.

Developers should have access to advanced configuration when required.

---

# Supported User Types

• Business User

• Developer

• Team Member

• Super Admin

---

# First Time User Journey

Open Orbis

↓

Login

↓

Create Workspace

↓

Choose User Type

↓

Start Conversation

---

# Login Methods

Business Users

• Google

• Email + OTP

Developer Mode

Additional developer services can be connected later.

---

# Business User Workflow

Business users interact with Orbis using natural language.

Users may:

• Ask questions

• Request software

• Upload documents

• Upload images

• Use voice input

No technical knowledge is required.

---

# Supported Inputs

• Text

• Voice

• Images

• PDF

• Documents

• Spreadsheet

• Code Files

Future Support

• Camera

• Screen Sharing

---

# AI Conversation Workflow

User starts a conversation.

Orbis understands the user's intent.

If the user is asking questions,
Orbis responds as an AI assistant.

If the user wants to build software,
Orbis automatically suggests starting a software project.

User approval is required before entering Software Development Mode.

---

# Smart Intent Detection

The platform should automatically identify whether the user needs:

• General AI Assistance

or

• Software Development

without requiring the user to manually change modes.

---

# Developer Workflow

Developers may enable Developer Mode.

Developer Mode unlocks:

• GitHub

• Supabase

• Vercel

• AI Provider Settings

• Advanced Configuration

Developer Mode remains optional.

Business users never need to use it.

---

# Workspace Lifecycle

Create Workspace

↓

Project Creation

↓

AI Discussion

↓

Requirement Analysis

↓

Documentation

↓

Software Build

↓

Preview

↓

User Approval

↓

Deployment

↓

Maintenance

---

# GitHub Workflow

Every software project should have its own repository.

GitHub acts as the official source of project files and documentation.

---

# Live Preview Workflow

Software changes generate a preview.

Users review the preview.

Users approve or request changes.

Deployment only occurs after approval.

---

# User Experience Principles

Simple

Natural

Conversation First

Business First

Developer Ready

Minimal Learning Curve

---

# Workflow Rules

Business users should never be forced to understand development tools.

Developer Mode is optional.

Software projects always begin with requirement analysis.

Documentation is created before implementation.

User approval is required before deployment.

---

# Relationship to Other Documents

System Design → 04_SYSTEM_ARCHITECTURE.md

Development Process → 06_DEVELOPMENT_WORKFLOW.md

Security → 12_SECURITY.md

Deployment → 13_DEPLOYMENT.md

---

End of Document
