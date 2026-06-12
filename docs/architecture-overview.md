# Architecture Overview

This document outlines the architecture, data components, system topologies, storage layouts, and API interfaces for **e-Patra**.

---

## High-Level Component Topology

e-Patra is built on a hybrid desktop client-server architecture where both layers run locally on the user workstation:

```
┌───────────────────────────────────────┐
│        Desktop Tauri GUI (React)      │
└───────────────────┬───────────────────┘
                    │ REST API / WebSockets (localhost:8080)
                    ▼
┌───────────────────────────────────────┐
│     Local Spring Boot Backend (JVM)    │
└─────────┬───────────────────┬─────────┘
          │                   │
          ▼ SQL               ▼ IO
┌───────────────────┐   ┌───────────────────────┐
│   SQLite File     │   │ Organized Files Dir   │
│ (file_metadata.db)│   │ (organized/type/year) │
└───────────────────┘   └───────────────────────┘
```

1. **Frontend (Tauri + React + Vanilla CSS):**
   - Renders the desktop GUI shell using Tauri (Rust-based web container).
   - Manages dashboards, categories, file ingestion interfaces, and indexing logs.
   - Operates in a **Mock Sandbox Mode** if the local JVM backend is unreachable.

2. **Backend (Spring Boot 3 + SQLite):**
   - Runs a lightweight JVM-based REST and WebSocket service locally on port `8080`.
   - Manages file system directory layouts, SQLite indexing database, and SHA-256 deduplication logic.

---

## Operating Modes

e-Patra operates in one of two modes based on loopback connectivity:

### 1. Live Local Mode
- **Condition:** Spring Boot server running on `http://localhost:8080`.
- **Capabilities:** Direct physical file ingestion, SHA-256 payload deduplication checks, database querying, and live workstation cold-backup tracking.

### 2. Mock Sandbox Mode
- **Condition:** Frontend client is open but local Spring Boot backend is offline.
- **Capabilities:** Automatic client-side fallback utilizing browser `localStorage` state. Allows visual interface testing, category taxonomy creation, mock file uploads, and simulated backup workflows without requiring a Java runtime.

---

## System Storage Layouts

### 1. Unified Local File Storage
All ingested documents are copied and structured inside a unified repository directory:
```text
organized/{file_extension}/{year}/{month}/{filename}
```
- The file type subdirectory (e.g., `pdf`, `png`) is derived using standard MIME inspection.
- Target year and month groups are determined using the file's last-modified timestamp.
- Path identifiers are stored **relatively** in the relational database, ensuring database portability across absolute workstation directories.

### 2. SHA-256 Content Deduplication
Before writing any file to disk, the backend executes the following:
1. Calculates the SHA-256 byte stream hash of the uploaded document.
2. Queries the `file_metadata` database table for duplicate hash fields.
3. If matching records exist, it aborts the database transaction, deletes temp files, and reports a duplicate warning to the user.

---

## API Reference Manual

The Tauri fronted communicates with the backend on `localhost:8080` using loopback REST API endpoints and WebSocket channels:

### 1. File Management API (`/api/files`)

* **Ingest a Document (Upload)**
  - **POST** `/api/files/upload`
  - **Request Content Type:** `multipart/form-data`
  - **Payload:**
    - `file` (MultipartFile): Document payload
    - `description` (String): Search description text
    - `category` (String): Classification category
    - `subCategory` (String): Classification subcategory
  - **Response:** `200 OK` on success, `500 Internal Server Error` on duplication or write failure.

* **Store Local File directly**
  - **POST** `/api/files/store-local`
  - **Parameters:** `filePath` (String)
  - **Response:** `200 OK` with target write path.

* **Retrieve All Ingested Files**
  - **GET** `/api/files/all`
  - **Response:** `200 OK` returning `List<FileInfo>` array.

* **Retrieve Recent Ingests**
  - **GET** `/api/files/recent`
  - **Response:** `200 OK` returning top 10 `List<FileInfo>` entries.

* **Search Indexed Files**
  - **GET** `/api/files/search`
  - **Parameters:**
    - `query` (String): Matches file names or descriptions
    - `category` (String, optional): Category filter
    - `subCategory` (String, optional): Subcategory filter
    - `fileType` (String, optional): Extension filter
    - `dateFrom` (Date, optional) / `dateTo` (Date, optional): Upload timeline boundaries
  - **Response:** `200 OK` returning filtered `List<FileInfo>` array.

* **Inspect Storage Telemetry**
  - **GET** `/api/files/storage-stats`
  - **Response:** `200 OK` with workspace storage byte sizes and path locations.

* **Open File Location on Desktop**
  - **POST** `/api/files/metadata/{id}/open-location`
  - **Response:** `200 OK` (opens the system file explorer highlighted on the file).

* **Launch / Run Local File**
  - **POST** `/api/files/metadata/{id}/run`
  - **Response:** `200 OK` (spawns the file in the operating system default handler).

### 2. Category Master API (`/api/categories`)

* **List Categories & Subcategories**
  - **GET** `/api/categories`
  - **Response:** `List<Category>` with nested `subCategories`.

* **Create Category**
  - **POST** `/api/categories`
  - **Parameters:** `name` (String)

* **Update Category**
  - **PUT** `/api/categories/{id}`
  - **Parameters:** `name` (String)

* **Delete Category**
  - **DELETE** `/api/categories/{id}`

* **Create Subcategory**
  - **POST** `/api/categories/{id}/subcategories`
  - **Parameters:** `name` (String)

* **Update Subcategory**
  - **PUT** `/api/categories/subcategories/{id}`
  - **Parameters:** `name` (String)

* **Delete Subcategory**
  - **DELETE** `/api/categories/subcategories/{id}`

### 3. System Backup API (`/api/backup`)

* **Retrieve Backup History**
  - **GET** `/api/backup/history`
  - **Response:** `200 OK` with JSON list of past `BackupRecord` items.

* **Start Cold Backup**
  - **POST** `/api/backup/create`
  - **Response:** `200 OK` returning backup target location.

* **WebSocket Progress Tunnel**
  - **Protocol:** WebSocket (`ws://localhost:8080/progress`)
  - **Payload:** Raw strings containing progress statuses streamed down from the file copier to the UI terminal shell.
