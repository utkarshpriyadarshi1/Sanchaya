# e-Dastavej Features Status Registry

This document tracks the current features of **e-Dastavej Document Management System** and their development/deployment status.

## Core Services & Architecture

| Feature Component | Description | Status |
| :--- | :--- | :--- |
| **Backend Service** | Spring Boot 3 standalone local server listening on `http://localhost:8080` | **Completed** |
| **Local Database** | Embedded SQLite engine managing relations, categories, audit logs | **Completed** |
| **Frontend Client** | Tauri desktop window container rendering React + Tailwind CSS client | **Completed** |
| **API WebSockets** | Local WebSocket connection for real-time progress & status feedback | **Completed** |

---

## Functional Features

### 1. Security & Local Access Control
* **Predefined Roles:** `ADMIN`, `MANAGER`, `STAFF`, `CLERK`, `PUBLIC` to partition workstations.
* **Credentials:** BCrypt hashed password authentication.
* **Status:** **Completed**

### 2. Document Management & Deduplication
* **Organized Storage:** Automatic structuring into physical folders: `organized/{file_type}/{year}/{month}/{filename}`.
* **SHA-256 Check:** Computes file hashes on stream inputs to detect duplicate files.
* **Automatic Rollback:** Halts uploads if duplicate content matches, preventing disk waste.
* **Status:** **Completed**

### 3. Smart Local Search & Metadata
* **Custom Categories:** Structured categorization using custom tags, categories, and subcategories.
* **Query Engines:** Multi-criteria search filters supporting text querying, category filtering, file extension sorting, and date ranges.
* **Status:** **Completed**

### 4. System Backup & Restore
* **JSON Backups:** Database configuration and metadata state exports/imports.
* **Status:** **Completed**

---

## Build & Run Script Features

| Script Tool | Target Environment | CLI Actions | Status |
| :--- | :--- | :--- | :--- |
| **run.bat (Option 1)** | **Development** | Concurrent launcher opening backend (Spring Boot run) and frontend (Tauri dev) in separate CMD windows | **In Progress** |
| **run.bat (Option 2)** | **Production** | Runs Maven package compiler and builds Tauri release wrapper outputting a native `.exe` installer | **In Progress** |
| **run.bat (Option 3)** | **Clean Up** | Clears out Java target files and Rust compiler target/build directories to free disk space | **In Progress** |
