# ORBIS

# MEMORY RESPONSIBILITY MATRIX

Version: 1.0

Status: Engineering Reference

Document ID: 38

Project: ORBIS – Universal AI Engineering Platform

Category: Engineering Architecture

Module: Memory System

Author: ORBIS Architecture Team

Chief Architect: ChatGPT

Implementation Partner: Gemini

Repository: ORBIS

Last Updated: July 2026

---

# Executive Summary

This document defines the official responsibility matrix for every component participating in the ORBIS Memory System.

Its purpose is to eliminate overlapping responsibilities and establish a single source of truth before implementation begins.

No production code shall violate this responsibility matrix.

---

# Engineering Goal

Every module must have one clear responsibility.

One Module

↓

One Responsibility

↓

One Interface

↓

One Communication Path

---

# Memory Responsibility Matrix

## 1. Brain Controller

Responsibilities

- Receive user request
- Request memory from Memory Interface
- Send prepared context to AI Provider
- Receive provider response
- Send updated conversation back to Memory Interface

Must NOT

- Access database directly
- Access Supabase directly
- Save memory directly
- Read memory directly

---

## 2. Memory Interface

Responsibilities

- Official entry point to Memory
- Load Memory
- Save Memory
- Update Memory
- Delete Memory
- Search Memory
- Coordinate Memory Engine

Must NOT

- Store data directly
- Contain business logic
- Communicate with Frontend

---

## 3. Memory Engine

Responsibilities

- Merge conversation context
- Prepare Brain context
- Manage session memory
- Resolve memory conflicts
- Build memory package

Must NOT

- Access database directly
- Communicate with AI Provider
- Update Dashboard directly

---

## 4. Memory Repository

Responsibilities

- Read
- Write
- Update
- Delete
- Persistent storage operations

Must NOT

- Execute Brain logic
- Execute business rules
- Process AI responses

---

## 5. Memory Governance

Responsibilities

- Memory retention policy
- Cleanup policy
- Expiration policy
- Memory size limits

Must NOT

- Save conversations
- Generate responses

---

## 6. Vector Engine

Responsibilities

- Semantic indexing
- Similarity search
- Future long-term intelligence

Must NOT

- Replace Repository
- Replace Memory Engine

---

## 7. Provider Layer

Responsibilities

- Receive prepared context
- Generate response
- Return response

Must NOT

- Save Memory
- Load Memory
- Access Repository

---

## 8. Developer Dashboard

Responsibilities

Display only

- Memory Load
- Memory Save
- Memory Restore
- Memory Sync
- Repository Status
- Pending Operations
- Failed Operations
- Last Save
- Last Load
- Active Session

Dashboard is READ ONLY.

Dashboard never modifies memory.

---

## 9. Supabase

Responsibilities

Persistent storage only.

Must never execute business logic.

---

# Official Communication Path

Frontend

↓

API

↓

Brain Controller

↓

Memory Interface

↓

Memory Engine

↓

Memory Repository

↓

Supabase

↓

Memory Repository

↓

Memory Engine

↓

Brain Controller

↓

Provider

↓

Brain Controller

↓

Memory Interface

↓

Memory Repository

↓

Supabase

↓

Developer Dashboard

---

# Engineering Rules

Rule 01

Brain talks only to Memory Interface.

Rule 02

Memory Interface is the single gateway.

Rule 03

Repository only stores data.

Rule 04

Dashboard only observes.

Rule 05

Providers never touch storage.

Rule 06

Storage never knows Brain.

Rule 07

Every memory operation must generate an engineering event.

Rule 08

Every engineering event must be visible in Developer Dashboard.

---

# Future Expansion

Future modules must connect only through approved interfaces.

Examples

Vision Engine

↓

Memory Interface

Workflow Engine

↓

Memory Interface

Supervisor

↓

Memory Interface

Engineering Intelligence Engine

↓

Memory Interface

No direct communication is permitted.

---

# Replacement Policy

No file replacement shall begin until this matrix is accepted.

Every future implementation must follow this responsibility model.

---

# Status

Memory Responsibility Matrix

APPROVED AS ENGINEERING BASELINE

Implementation

READY TO BEGIN

---

# Engineering Principle

Responsibility first.

Implementation second.

Architecture always.

---

Copyright © 2026 ORBIS Project

All Rights Reserved.