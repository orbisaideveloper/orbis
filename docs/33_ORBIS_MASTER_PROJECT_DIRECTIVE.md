# ORBIS

# MASTER PROJECT DIRECTIVE

Version: 1.0

Status: Approved

Document ID: 33

Project: ORBIS – Universal AI Engineering Platform

Category: Master Project Directive

Author: ORBIS Architecture Team

Architecture Review: ChatGPT

Implementation Partner: Gemini

Repository: ORBIS

Last Updated: July 2026

---

# Executive Summary

This document defines the permanent engineering philosophy, development workflow, architecture, and long-term vision of ORBIS.

It serves as the primary engineering reference for every future development phase, AI implementation partner, contributor, and software engineer working on the ORBIS project.

Every future implementation must follow this directive before writing or modifying any code.

---

# Project Vision

ORBIS is **not** a chatbot.

ORBIS is **not** another AI model.

ORBIS is a **Universal AI Engineering Platform**.

Its purpose is to become a unified engineering platform capable of orchestrating multiple AI providers, memory systems, developer tools, databases, workflows, and business modules under one intelligent Brain.

Long-Term Vision:

**One Brain.**

**Many AI Providers.**

**One Engineering Platform.**

---

# Core Mission

The ORBIS Brain is permanent.

AI Providers are replaceable.

ORBIS must always remain provider-independent.

Current Provider:

- Gemini

Future Providers:

- OpenAI
- Claude
- DeepSeek
- Local Models
- Future AI Providers

No engineering decision should lock ORBIS to a single provider.

---

# Engineering Philosophy

ORBIS development follows these permanent principles:

- Documentation First
- Architecture First
- Engineering First
- Maintainability First
- Debuggability First
- Scalability First
- Stability Before Speed

Quick fixes are prohibited.

Long-term engineering quality always has higher priority than rapid feature delivery.

---

# LEGO Architecture (Locked)

ORBIS follows a LEGO-style modular architecture.

Every module must be an independent engineering component.

Rules:

- Never rewrite stable modules.
- Never tightly couple unrelated modules.
- New functionality must be added as new modules.
- Existing modules must remain independently replaceable.
- Failures should remain isolated.

---

# Official System Architecture

Official execution flow:

User

↓

Frontend

↓

Global Event Bus

↓

Router

↓

ORBIS Brain

↓

Decision Manager

↓

Provider Registry

↓

Selected AI Provider

↓

Response Formatter

↓

Frontend

The Router must never bypass the Brain.

The Brain always makes routing decisions.

---

# ORBIS Brain Responsibilities

The Brain decides:

- Should ORBIS answer directly?
- Should Gemini answer?
- Should another AI Provider answer?

Routing logic always belongs to the Brain.

Providers never make routing decisions.

---

# Memory Philosophy

Memory is one of the permanent pillars of ORBIS.

Current memory layers:

- Conversation Memory
- Working Memory
- Supervisor Memory
- Persistent Memory
- Project Memory

Future memory improvements must strengthen decision quality without increasing unnecessary complexity.

---

# Developer Dashboard Philosophy

The Developer Dashboard is **not** a visual feature.

It is the Engineering Control Room.

Every important subsystem must expose live engineering information.

Dashboard responsibilities include:

- Brain Status
- Router Status
- Memory Status
- Provider Status
- Event Bus
- Workflow
- API Health
- Performance
- Errors
- Runtime Logs
- Module Health
- Telemetry

The dashboard must become the primary debugging interface for the ORBIS platform.

---

# Development Workflow

Official workflow:

SPCK Editor

↓

GitHub

↓

GitHub Actions

↓

Render Deployment

↓

Developer Dashboard Validation

↓

User Review

↓

Approval

↓

Next Task

This workflow must remain unchanged unless officially approved.

---

# Quality Requirements

The project must always remain compatible with:

- GitHub Actions
- Jest
- ESLint
- SonarQube
- CodeQL
- Dependabot

Engineering quality must never be sacrificed for speed.

---

# Development Rules

Every new implementation must:

- Preserve LEGO Architecture.
- Preserve backward compatibility.
- Avoid modifying stable modules unnecessarily.
- Create new modules for new functionality.
- Maintain clean separation of responsibilities.
- Be fully testable.
- Be easy to debug.
- Be independently maintainable.

---

# Current Development Phase

Current Phase:

**Phase 6B**

Current Objectives:

- Complete the Engineering Dashboard.
- Improve Brain visibility.
- Improve debugging capability.
- Improve module monitoring.
- Strengthen engineering diagnostics.
- Stabilize engineering infrastructure.

No major feature expansion should begin until these objectives are completed.

---

# Long-Term Roadmap

Future development includes:

- Multi-AI Collaboration
- Vision Intelligence
- Document Intelligence
- Voice Intelligence
- Tool Engine
- API Gateway
- Authentication
- Business Modules
- Automation
- AI Engineering Workspace

All future work must remain consistent with this directive.

---

# Final Engineering Principle

Every engineering decision must support the long-term vision of ORBIS.

Never optimize for speed.

Never optimize for visual appearance.

Always optimize for:

- Architectural Correctness
- Maintainability
- Scalability
- Engineering Quality
- AI Orchestration Readiness

This directive supersedes implementation shortcuts.

---

# References

24_PHASE_2_ARCHITECTURE_DIRECTIVE.md

29_PHASE_4_FINAL_COMPLETION_AUDIT_REPORT.md

31_PHASE_5_FINAL_COMPLETION_AUDIT_REPORT.md

32_ORBIS_SOURCE_CODE_ARCHITECTURE.md

---

# Approval

Status

**APPROVED**

This document becomes the permanent engineering constitution of the ORBIS Project.

---

Copyright © 2026 ORBIS Project

All Rights Reserved.