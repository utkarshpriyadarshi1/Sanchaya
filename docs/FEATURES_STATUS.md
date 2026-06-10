# e-Dastavej Features Status Registry

This document tracks the implemented features of the **e-Dastavej Document Management System** and documents the project's roadmap plans.

---

## Core Infrastructure & Services

| Feature Component | Description | Status |
| :--- | :--- | :--- |
| **Backend Service** | Spring Boot 3 standalone local REST server listening on `http://localhost:8080` | **Completed** |
| **Local Database** | Embedded SQLite 3 engine managing relational files, categories, and backup records | **Completed** |
| **Frontend Client** | Tauri native desktop shell container rendering React + Tailwind CSS client interface | **Completed** |
| **WebSocket Console Channel** | Real-time backup status and folder iteration streaming over `ws://localhost:8080/progress` | **Completed** |
| **Mock Sandbox Mode** | Automatic frontend fallback configuration when backend service is offline | **Completed** |

---

## Functional Features

### 1. Document Management & Deduplication
* **Structured Local Storage:** Automatically groups ingested files into organized physical directories: `organized/{extension}/{year}/{month}/{filename}`.
* **SHA-256 Integrity Verification:** Computes stream checksums on upload to detect matching file payloads.
* **Deduplication Safeguards:** Halts duplicate document uploads, auto-deletes temp logs, and rolls back transaction steps to prevent disk waste.
* **Status:** **Completed**

### 2. Search Engine & Categorization
* **Relational Category Master:** User setup configurations managing nested tags and categories via Category & Subcategory Master.
* **Multi-Criteria Filter Queries:** Immediate searches based on description tags, extensions, upload dates, categories, and subcategories.
* **Status:** **Completed**

### 3. Workstation File Interactions
* **Open Directory:** Directly highlights the file's absolute path within the system file explorer (Windows Explorer) from the GUI dashboard.
* **Launch Local Files:** Runs/opens documents directly using the host operating system's default program handlers.
* **Status:** **Completed**

---

## Backup & Recovery Systems

| Feature | Details | Status |
| :--- | :--- | :--- |
| **Folder Replication** | Replicates all organized database document folders to `backups/backup_[timestamp]` | **Completed** |
| **Backup Record Indexing** | Logs execution timestamps, target directories, and statuses in the SQLite database | **Completed** |
| **JSON Settings Backup & Import** | Export/import category setups and document index lists to portable `.json` files | *Planned / Roadmap* |
| **Zip Compression Archives** | Package directory backups in compressed `.zip` folders | *Planned / Roadmap* |

---

## Security & Station Partitioning

| Feature | Details | Status |
| :--- | :--- | :--- |
| **Predefined Workstation Roles** | Pre-configured user permission modes (`ADMIN`, `MANAGER`, `STAFF`, `CLERK`, `PUBLIC`) | *Planned / Roadmap* |
| **Secure Local Credentials** | Hashed local database logins using BCrypt credentials verification | *Planned / Roadmap* |
| **API-level Spring Security** | Restrict file open and execution actions based on authenticated role | *Planned / Roadmap* |

---

## Utility Launch Scripts

| Script Command | Environment | CLI Actions | Status |
| :--- | :--- | :--- | :--- |
| **dev.bat / dev.sh** | **Development** | Concurrent launcher opening backend (Spring Boot run) and frontend (Tauri dev) in separate CMD windows | **Completed** |
| **build.bat / build.sh** | **Production** | Runs Maven package compiler and builds Tauri release wrapper outputting native `.msi` and `.exe` installers | **Completed** |
| **clean.bat / clean.sh** | **Clean Up** | Clears out Java target files and Rust compiler target/build directories to free disk space | **Completed** |
