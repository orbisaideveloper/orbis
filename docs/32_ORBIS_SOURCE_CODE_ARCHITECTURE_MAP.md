# ORBIS

# SOURCE CODE ARCHITECTURE MAP

Version: 1.0

Status: Approved

Document ID: 32

Project: ORBIS – Universal AI Engineering Platform

Category: Source Code Architecture

Author: ORBIS Architecture Team

Architecture Review: ChatGPT

Implementation Partner: Gemini

Repository: ORBIS

Last Updated: July 2026

---

# Executive Summary

This document is the official source code architecture reference for the ORBIS repository.

Unlike the previous Architecture Directives and Completion Reports, this document describes the actual organization of the ORBIS source code.

Its purpose is to help developers, AI coding assistants and future contributors understand the repository without reading every source file individually.

This document should always remain synchronized with the repository.

---

# Purpose

The objectives of this document are:

• Explain the complete repository structure.

• Explain every important source folder.

• Explain module responsibilities.

• Explain module relationships.

• Explain execution flow.

• Explain dependency direction.

• Preserve architecture knowledge.

• Reduce onboarding time for future developers.

---

# Repository Overview

The ORBIS repository is organized into five major engineering areas.

Repository

├── Documentation

├── GitHub Infrastructure

├── Source Code

├── Testing

└── Configuration

Each area has a dedicated responsibility.

---

# Repository Structure

ORBIS

├── docs/

Official project documentation.

Contains Architecture Directives,
Completion Reports,
Engineering Policies,
Source Code Documentation.

---

├── .github/

Contains

GitHub Actions

CodeQL

Dependabot

CI/CD Workflows

Automation

---

├── src/

Contains the complete ORBIS Brain implementation.

This is the primary engineering directory.

Every production module belongs here.

---

├── tests/

Contains testing utilities,
validation scripts,
and future integration tests.

---

Configuration Files

package.json

eslint.config.js

jest.config.js

sonar-project.properties

README.md

---

# Source Code Overview

The src directory is divided into independent engineering modules.

Each module owns a single responsibility.

Modules communicate through defined interfaces instead of direct coupling.

This keeps the architecture scalable and maintainable.

---

# High Level Source Tree

src/

├── brain/

│

├── collaboration/

├── context/

├── coordination/

├── core/

├── dashboard/

├── decision/

├── execution/

├── memory/

├── orchestrator/

├── planner/

├── providers/

├── recovery/

├── registry/

├── review/

├── security/

├── tools/

└── workflow/

---

# Brain Folder

brain/

Purpose

Central intelligence of ORBIS.

Responsibilities

Receive requests.

Coordinate modules.

Manage execution.

Return final response.

Everything eventually flows through the Brain.

---

# Core Modules

BrainController

Controls complete execution lifecycle.

DecisionEngine

Determines system behavior.

InputHandler

Receives external requests.

BrainHub

Central module coordination.

index.js

Exports the public Brain API.

---

# Architecture Philosophy

The Brain never performs business logic directly.

Instead,

it delegates work to specialized modules.

This keeps the architecture modular,
replaceable,
and future-proof.

---

End of Part 1

Continue with Part 2

---

# PART 2

# Brain Architecture & Module Relationships

---

# ORBIS Brain Overview

The ORBIS Brain is the central orchestration engine of the entire platform.

It does not perform business logic directly.

Instead, it coordinates specialized modules that each perform a single engineering responsibility.

This architecture follows the LEGO Architecture introduced in Phase 2.

Every module remains independent, replaceable and testable.

---

# Brain Execution Lifecycle

Every user request follows the same execution pipeline.

User Request

↓

InputHandler

↓

BrainController

↓

DecisionEngine

↓

DecisionManager

↓

Capability Registry

↓

Provider Registry

↓

Provider Orchestrator

↓

Execution Bridge

↓

Workflow Engine

↓

Tool Engine

↓

Memory Engine

↓

Context Engine

↓

Review Engine

↓

Developer Dashboard

↓

Final Response

Every execution follows this lifecycle.

No module should bypass this execution path.

---

# Module Relationship

BrainController

Purpose

Acts as the master coordinator.

Responsibilities

• Starts execution

• Controls execution lifecycle

• Coordinates Brain modules

• Returns final response

Dependencies

Decision Engine

Workflow Engine

Memory Engine

Review Engine

---

Decision Engine

Purpose

Determines what ORBIS should do.

Responsibilities

• Analyze request

• Select execution strategy

• Choose workflow

• Communicate with Decision Manager

Dependencies

Decision Manager

Capability Registry

---

Decision Manager

Purpose

Converts user intent into executable decisions.

Responsibilities

• Analyze task

• Determine capabilities

• Select provider

• Prepare execution request

Dependencies

Capability Registry

Provider Registry

---

Capability Registry

Purpose

Stores provider capabilities.

Responsibilities

• Provider capability lookup

• Feature matching

• Routing support

Dependencies

Provider Registry

---

Provider Registry

Purpose

Acts as the central provider catalog.

Responsibilities

• Register providers

• Discover providers

• Remove providers

• Load providers

Dependencies

Provider Orchestrator

---

Provider Orchestrator

Purpose

Coordinates provider execution.

Responsibilities

• Initialize provider

• Route request

• Handle lifecycle

Dependencies

Providers

Recovery Engine

---

Execution Bridge

Purpose

Acts as the communication bridge between Brain and AI providers.

Responsibilities

• Prepare provider request

• Execute provider

• Receive provider response

Dependencies

Provider Orchestrator

Recovery Engine

---

Workflow Engine

Purpose

Coordinates multi-step execution.

Responsibilities

• Execute workflow

• Manage execution order

• Handle workflow state

Dependencies

Planner

Execution Bridge

---

Agent Planner

Purpose

Break large tasks into logical execution steps.

Responsibilities

• Task planning

• Step generation

• Workflow preparation

Dependencies

Workflow Engine

---

Collaboration Hub

Purpose

Coordinates multiple AI systems.

Responsibilities

• Multi-provider collaboration

• Session coordination

• Shared execution state

Dependencies

Workflow Engine

Provider Orchestrator

---

Multi-AI Collaboration

Purpose

Allow multiple AI providers to solve the same task.

Example

Planner

↓

Coder

↓

Reviewer

↓

Final Output

No provider should work in complete isolation.

---

Review Engine

Purpose

Evaluates execution quality.

Responsibilities

• Review execution

• Validate workflow

• Generate engineering feedback

Dependencies

Developer Dashboard

System Health Dashboard

---

Engineering Principle

Every Brain module owns only one responsibility.

Modules communicate through interfaces.

Modules never access each other's internal implementation directly.

This guarantees

• Loose Coupling

• High Cohesion

• Scalability

• Replaceability

• Testability

---

Module Dependency Rules

Allowed

Brain

↓

Decision

↓

Registry

↓

Provider

↓

Execution

↓

Workflow

↓

Memory

↓

Review

↓

Dashboard

Not Allowed

Dashboard

↓

Decision Engine

Provider

↓

Memory Database

Workflow

↓

GitHub

Business Modules

↓

Providers

These dependency rules must never be violated.

---

End of Part 2

Continue with Part 3

---

# PART 3

# System Architecture, Engineering Rules & Future Expansion

---

# Memory Architecture

The Memory System is one of the core foundations of ORBIS.

Unlike traditional AI systems, ORBIS separates memory management into multiple independent modules.

Memory is never accessed directly by business modules.

All memory operations must pass through the Memory Engine.

---

## Memory Structure

Memory Engine

↓

Memory Repository

↓

Memory Interface

↓

Memory Governance

↓

Vector Engine

↓

Future Database Layer

---

## Module Responsibilities

### Memory Engine

Central memory coordinator.

Responsibilities

• Save Memory

• Load Memory

• Search Memory

• Delete Memory

• Update Memory

---

### Memory Repository

Acts as the storage abstraction layer.

Responsibilities

• Read

• Write

• Cache

• Storage Interface

---

### Memory Interface

Public API for every memory request.

No module communicates directly with Memory Repository.

---

### Memory Governance

Responsible for privacy and lifecycle management.

Responsibilities

• User Consent

• Memory Policies

• Forget Operations

• Data Ownership

• Retention Rules

---

### Vector Engine

Responsible for semantic retrieval.

Current Status

Architecture Ready

Production implementation will continue in future phases.

---

# Provider Architecture

ORBIS supports multiple AI providers through a provider-independent architecture.

Providers never
