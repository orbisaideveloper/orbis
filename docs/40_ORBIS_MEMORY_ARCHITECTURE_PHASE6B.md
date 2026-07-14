# ORBIS Engineering Documentation

## Document ID
DOC-040

## Title
ORBIS Memory Architecture – Phase 6B Stable

## Status
APPROVED

## Version
6B Stable

## Purpose

This document defines the official Memory Architecture of ORBIS after the Phase 6B stabilization.

This document becomes the permanent reference for all future Memory-related development.

---

# Memory Architecture

```
Frontend
      │
      ▼
server.js
      │
      ▼
BrainController
      │
      ▼
MemoryInterface
      │
      ▼
MemoryEngine
      │
      ▼
MemoryRepository
      │
      ▼
Supabase
```

---

# Layer Responsibilities

## Layer 1

MemoryInterface

Purpose

Official Memory Gateway.

Responsibilities

- Receive all memory requests
- Maintain backward compatibility
- Route requests
- Prevent direct repository access

---

## Layer 2

MemoryEngine

Purpose

Runtime Memory Manager.

Responsibilities

- RAM Cache
- Conversation Cache
- User Memory
- Project Memory
- Session Memory
- Cognitive Memory
- Embedding Logic
- Semantic Search
- Telemetry Events

---

## Layer 3

MemoryRepository

Purpose

Persistent Storage Layer.

Responsibilities

- Supabase Communication
- Compression
- Decompression
- Database Read
- Database Write

No business logic exists here.

---

# Current Memory Flow

User

↓

BrainController

↓

MemoryInterface

↓

MemoryEngine

↓

MemoryRepository

↓

Supabase

↓

MemoryEngine

↓

BrainController

↓

Response

---

# Current Features

✔ Conversation Restore

✔ Conversation Save

✔ Session Memory

✔ User Memory

✔ Project Memory

✔ Cognitive Memory

✔ Semantic Search

✔ LZ Compression

✔ Supabase Storage

✔ Telemetry Integration

---

# Dashboard Integration

Current Dashboard provides

- DB Status
- Memory Sync
- Nodes
- Queue
- Logs
- Execution Bus
- RAM
- Ping

---

# Freeze Rules

Do not bypass MemoryInterface.

Do not access MemoryRepository directly.

Do not add new Memory APIs without approval.

MemoryRepository must remain Storage Only.

MemoryEngine must remain Runtime Only.

---

# Known Limitations

Developer Dashboard still requires

- Memory Hit
- Memory Miss
- Cache Hit
- Cache Miss
- Event Timeline
- Memory Health
- Repository Statistics
- Cognitive Search Statistics

---

# Next Phase

Phase 9.1

Developer Dashboard Enhancement

Phase 9.2

Brain Intelligence

Phase 9.3

Workflow Engine

---

# Approval

Chief Architecture

Approved

Memory Layer

Stable

Future development must follow this document.