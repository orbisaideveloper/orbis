# ORBIS

# MEMORY API STANDARD

Version: 1.0

Status: APPROVED

Document ID: 39

Project: ORBIS – Universal AI Engineering Platform

Category: Engineering Standard

Module: Memory API

Author: ORBIS Architecture Team

Chief Architect: ChatGPT

Implementation Partner: Gemini

Repository: ORBIS

Last Updated: July 2026

---

# Executive Summary

This document defines the official Memory API Standard for the ORBIS platform.

Every memory-related module must communicate only through the APIs defined in this document.

No custom memory methods are permitted outside this specification.

This document becomes the official engineering contract for all future ORBIS Memory implementations.

---

# Engineering Objective

Provide one unified Memory API.

Every component in ORBIS shall communicate using the same method names.

No duplicate APIs.

No legacy APIs.

No direct repository access.

---

# Official Memory APIs

## Session Memory

saveSession(sessionId, data)

loadSession(sessionId)

clearSession(sessionId)

---

## Conversation Memory

saveConversation(sessionId, role, content)

loadConversation(sessionId, limit)

clearConversation(sessionId)

---

## User Memory

saveUser(key, value)

loadUser(key)

deleteUser(key)

---

## Project Memory

saveProject(projectId, value)

loadProject(projectId)

deleteProject(projectId)

---

## Cognitive Memory

saveCognitiveMemory(sessionId, prompt, response)

searchCognitiveMemory(prompt)

---

## Generic Memory

saveMemory(category, key, value)

loadMemory(category, key)

deleteMemory(category, key)

---

# Memory Interface Responsibilities

MemoryInterface shall expose only the official APIs.

MemoryInterface shall never store data directly.

MemoryInterface shall never contain business logic.

MemoryInterface shall communicate only with MemoryEngine.

---

# Memory Engine Responsibilities

MemoryEngine shall

- Process memory

- Merge context

- Build runtime context

- Coordinate repositories

- Manage cache

MemoryEngine shall never communicate directly with Frontend.

---

# Memory Repository Responsibilities

MemoryRepository shall

Read

Write

Update

Delete

Persistent storage only.

Repository shall never execute Brain logic.

---

# Brain Responsibilities

BrainController shall communicate only with MemoryInterface.

BrainController shall never access

MemoryRepository

Database

Supabase

directly.

---

# Provider Responsibilities

Providers receive prepared context only.

Providers never store memory.

Providers never load memory.

---

# Dashboard Responsibilities

Dashboard displays

Memory Status

Memory Events

Pipeline Health

Synchronization

Errors

Dashboard never modifies memory.

---

# Legacy API Deprecation

The following legacy methods are scheduled for removal during Memory Refactoring.

saveToMemory()

storeConversation()

addConversation()

setUserContext()

getUserContext()

setProjectContext()

getProjectContext()

These methods will be replaced by the official Memory API.

---

# Engineering Rules

Rule 01

One Memory Interface.

---

Rule 02

One Memory Engine.

---

Rule 03

One Repository.

---

Rule 04

One Official API.

---

Rule 05

No duplicate responsibilities.

---

Rule 06

Every memory operation must generate an engineering event.

---

Rule 07

Every engineering event must be visible inside the Developer Dashboard.

---

# Refactoring Order

Phase 1

MemoryInterface

↓

Phase 2

MemoryEngine

↓

Phase 3

MemoryRepository

↓

Phase 4

BrainController

↓

Phase 5

DecisionEngine Validation

↓

Phase 6

Developer Dashboard Validation

---

# Engineering Approval

This document officially freezes the Memory API specification.

All future implementations shall comply with this standard.

---

Status

APPROVED

Implementation

READY

Replacement

READY

---

Copyright © 2026 ORBIS Project

All Rights Reserved.