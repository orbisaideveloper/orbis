# ORBIS PROJECT INDEX

> AI Entry Point

---

# Document Information

Document Name : Project Index

Document ID : ORB-DOC-000

Version : 1.0

Status : Draft

Project : Orbis

Type : AI Software Development Platform

---

# Purpose

This document is the official entry point for every AI model and every developer working on the Orbis project.

Before making any code changes, every AI and developer must read this document and then continue reading the required documentation in the order listed below.

No implementation should begin before understanding the project documentation.

---

# About Orbis

Orbis is NOT another AI model.

Orbis is an AI Software Development Platform.

Its purpose is to coordinate multiple AI models, developer tools, cloud services and automation workflows to build complete production software from user requirements.

The user should simply describe the software they want.

Orbis will coordinate the complete development lifecycle.

---

# Core Principles

• Documentation First

• GitHub is the Single Source of Truth

• Modular Architecture

• AI Provider Independent

• Approval before major architectural changes

• Build → Test → Verify → Deploy

• Never hard-code a specific AI provider

---

# Documentation Reading Order

Read the documents in the following order.

01_PROJECT_CHARTER.md

02_PROJECT_IDENTITY.md

03_SYSTEM_ARCHITECTURE.md

04_WORKFLOW.md

05_BUSINESS_RULES.md

06_DEVELOPMENT_RULES.md

07_DATABASE_ARCHITECTURE.md

08_API_ARCHITECTURE.md

09_AI_ORCHESTRATION.md

10_SECURITY.md

11_DEPLOYMENT.md

12_DECISION_LOG.md

13_CHANGELOG.md

14_ROADMAP.md

---

# AI Working Rules

Every AI developer must:

1. Read the documentation.

2. Understand the project.

3. Explain the implementation plan.

4. Wait for approval when required.

5. Implement only approved changes.

6. Build the project.

7. Verify the build.

8. Explain changed files.

9. Update documentation if required.

---

# Never Do

Never ignore the documentation.

Never redesign the architecture without approval.

Never remove business logic.

Never overwrite existing decisions.

Never make destructive changes without approval.

---

# Project Structure

/docs

Documentation

/src

Application Source Code

/public

Public Assets

/supabase

Database

.github

GitHub Configuration

---

# Documentation Categories

Internal Documents

Google Docs only

Official Documents

GitHub /docs

Source Code

GitHub Repository

---

# Current Project Status

Phase

Foundation

Status

In Progress

Completed

✓ Project Identity

✓ Google Account

✓ GitHub Repository

✓ Bolt Connected

✓ Documentation Started

---

# Next Objective

Complete all documentation.

Complete infrastructure setup.

Start architecture implementation.

Begin Orbis core development.

---

---

# Mandatory Development Workflow

The following rules are mandatory for every AI model, developer, and automation tool working on the ORBIS Platform.

These rules remain permanently active unless officially updated.

---

## Development Rules

1. Documentation is always the first source of truth.

2. GitHub is the only implementation source of truth.

3. Read the required documentation before writing any code.

4. Work on ONE task at a time.

5. Never jump ahead to future features.

6. Never redesign the approved architecture without approval.

7. Reuse existing components and Shared Core before creating new ones.

8. Never duplicate business logic.

9. Keep the platform modular and production-ready.

---

## Mandatory Development Workflow

Every development task must follow this sequence:

Documentation

↓

Development Plan

↓

User Approval (when required)

↓

Implementation

↓

Build

↓

Testing

↓

Git Commit

↓

GitHub Push

↓

Preview

↓

Self Review

↓

Final Report

A task is NOT considered complete until every step above has been completed.

---

## Mandatory Build Verification

Before marking any task complete, always run:

- npm install
- npm run lint
- npm run build

If tests exist:

- npm test

All build, lint, and TypeScript errors must be fixed before continuing.

---

## GitHub Rules

Every completed change must be committed and pushed to the connected ORBIS GitHub repository.

Never leave completed work only inside the local Bolt workspace.

If GitHub Push cannot be completed, stop immediately and report the exact reason before ending the task.

---

## AI Integration Policy

The ORBIS Brain must remain AI-provider independent.

Do NOT hard-code any AI provider.

Prepare the platform so providers such as OpenAI, Gemini, Claude, and future providers can be connected through the approved ORBIS Brain and API Gateway architecture.

---

## Completion Policy

Before declaring any task complete, always provide:

- Development Plan
- What was changed
- Build Status
- Git Commit ID
- GitHub Push Confirmation
- Preview URL
- Self Review
- Remaining Issues (if any)

Only after the build succeeds, GitHub is updated, the Preview works, and the user approves the result may the task be considered complete.

---

# End of Document

End of Document
