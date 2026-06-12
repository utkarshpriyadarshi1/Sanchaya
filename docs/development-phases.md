# Development Phases & Feature Registry

This document tracks the historical development phases, current implementation statuses, and future roadmap directions for the **e-Patra Document Management System**.

---

## Core Feature Status Registry

### 1. System Infrastructure & Core Services

| Component Feature | Description | Status |
| :--- | :--- | :--- |
| **Spring Boot Backend** | JVM loopback REST service listening locally on port `8080` | **Completed** |
| **SQLite 3 Storage** | Relational file, category, and backup indexing metadata | **Completed** |
| **Tauri Desktop Client** | Standalone Rust container housing the React UI layer | **Completed** |
| **WebSocket Progress Channel** | Real-time copy console stream at `ws://localhost:8080/progress` | **Completed** |
| **Mock Sandbox Mode** | Automatic client fallback utilizing local browser storage state | **Completed** |

### 2. File Operations & Search Taxonomies

| Component Feature | Description | Status |
| :--- | :--- | :--- |
| **Structured Ingestion** | Dynamic workspace archiving inside `organized/{extension}/{year}/{month}/` | **Completed** |
| **SHA-256 Deduplication** | Stream checksum calculation verifying uniqueness prior to folder writes | **Completed** |
| **Category Master** | Relational categorization setup panels in the UI | **Completed** |
| **Multi-Criteria Search** | Combined queries by category, extension, tags, and date limits | **Completed** |
| **System Integrations** | Direct "Open Location" folder highlight and default app execution triggers | **Completed** |

---

## Structured Development Roadmap

### Phase 1: Local Ingestion & Indexing (Completed)
- Set up Spring Boot REST services for localhost loopback communication.
- Implemented file copy streams moving uploads into the organized extension and date paths.
- Setup SQLite 3 and JPA Hibernate dialect integration.
- Integrated SHA-256 duplicate payload detection filters.

### Phase 2: Search Engine & Classification (Completed)
- Designed frontend React single-page views with dashboard widgets.
- Built Category and Subcategory Master editing panels.
- Configured dynamic JPA query specifications for multi-field search logic.

### Phase 3: Desktop Shell & Backup Logging (Completed)
- Wrapped React interface into Tauri's Rust wrapper container.
- Established desktop integration endpoints opening OS explorer windows and launching file handlers.
- Created cold backup mechanisms copy-replicating directory structure.
- Configured Spring WebSockets streaming active progress logs to the UI terminal console.

### Phase 4: Local Security & Station Partitioning (Planned)
- Implement workstation permission levels (`ADMIN`, `MANAGER`, `STAFF`, `CLERK`, `PUBLIC`).
- Add BCrypt-hashed local database user accounts.
- Restrict file execution and delete operations via API-level Spring Security filters.

### Phase 5: Advanced Archive Packages (Planned)
- Add single-file compressed `.zip` backup generation.
- Implement JSON metadata import/export utilities for registry synchronization.
