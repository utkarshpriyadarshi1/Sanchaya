# Standalone Desktop Architecture Guide

This document outlines the architecture, data models, file organization patterns, and API interfaces for **e-Dastavej**.

---

## Component Overview

e-Dastavej is designed to run entirely on the local user machine using a hybrid desktop client-server architecture:

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

1. **Frontend (Tauri + React + Tailwind CSS):**
   * A native desktop application container managed by Tauri (Rust-based).
   * A React single-page application rendering dashboard widgets, document uploads, live logs, category setup, and search interfaces.
   * If the local Java service is offline, the React frontend automatically fails-safe into **Mock Sandbox Mode** to simulate the system locally using browser `localStorage` state.

2. **Backend (Spring Boot 3 + Hibernate + SQLite):**
   * A lightweight Java background service running locally on port `8080`.
   * Manages metadata indexation and physical files on the workstation disk.
   * Leverages an embedded SQLite engine for zero-configuration relational storage.

---

## System Storage Patterns

### 1. Unified Local File Storage
All ingested documents are auto-renamed and copied into a structured directory hierarchy under the application's root workspace:
```text
organized/{file_extension}/{year}/{month}/{filename}
```
* The file extension category (e.g., `pdf`, `png`) is determined dynamically via MIME inspection or filename fallback.
* Target years and months are computed using the file's last-modified timestamp to ensure timeline archiving accuracy.
* Relational paths stored in the SQLite database are kept **relative** to the storage root. This ensures metadata integrity and portability even if the workspace folder is relocated to another drive.

### 2. Duplicate Detection (SHA-256 Hashing)
Before any document is physically written to disk:
1. The backend service computes the file's SHA-256 integrity hash stream.
2. It queries the `file_metadata` database table for an existing record with the matching hash signature.
3. If a duplicate match is found, the backend aborts the upload, automatically rolls back transaction metadata, deletes any temporary files, and returns a duplicate conflict warning to the client.

### 3. Folder-Based Backups
Backups are performed by physically copying the entire `organized/` file tree to the designated `backups/backup_[timestamp]` path.
* The system utilizes a Spring WebSocket configuration at `/progress` to stream real-time file copy logging events down to the UI console during backup operations.
* A success record is logged in the `backups` SQLite table upon successful completion of the directory replication.

---

## Relational Database Schema

The SQLite schema consists of the following key tables managed via JPA:

### `files` (FileInfo)
Stores main document catalog entries and search indices.
* `id` (INTEGER, Primary Key, Autoincrement)
* `file_name` (TEXT, Not Null) — Ingested file name.
* `file_path` (TEXT, Not Null) — Absolute path on client workstation.
* `file_type` (TEXT, Not Null) — MIME Content Type of the document.
* `file_size` (INTEGER, Not Null) — File size in bytes.
* `description` (TEXT) — Searchable tag notes.
* `category` (TEXT) — Category classification.
* `sub_category` (TEXT) — Subcategory classification.
* `upload_date` (TIMESTAMP) — Date of database entry.

### `file_metadata` (FileMetadata)
Tracks the physical layout of files inside the `organized/` directory.
* `id` (INTEGER, Primary Key, Autoincrement)
* `original_path` (TEXT) — Path of the file before ingestion.
* `stored_path` (TEXT) — Relative path inside the `organized/` directory.
* `file_type` (TEXT) — Extracted file extension.
* `year` (TEXT) — Organized folder year folder grouping.
* `month` (TEXT) — Organized folder month folder grouping.
* `file_size` (INTEGER) — File size in bytes.
* `hash` (TEXT, Unique) — SHA-256 checksum signature for duplication filters.

### `categories` & `sub_categories`
Manages the structured tags master list.
* **Categories:** `id` (INTEGER PK), `name` (TEXT)
* **Subcategories:** `id` (INTEGER PK), `name` (TEXT), `category_id` (INTEGER FK referencing `categories`)

### `backups` (BackupRecord)
Tracks system pack executions.
* `id` (INTEGER, Primary Key, Autoincrement)
* `backup_path` (TEXT, Not Null) — Relative path to the generated backup folder.
* `backup_date` (TIMESTAMP) — Timestamp of backup execution.
* `status` (TEXT) — Result status (e.g., `SUCCESS`, `FAILED`).

---

## API Reference Manual

The client GUI communicates with the backend via the following local loopback REST endpoints and WebSocket protocols:

### File Management API (`/api/files`)

* **Ingest a Document (Upload)**
  * **POST** `/api/files/upload`
  * **Request Type:** `multipart/form-data`
  * **Parameters:**
    * `file` (MultipartFile, required): The document file.
    * `description` (String, required): Text description or keywords.
    * `category` (String, required): Name of the parent category.
    * `subCategory` (String, required): Name of the subcategory.
  * **Response:**
    * `200 OK` on success: `{"message": "File uploaded successfully!"}`
    * `500 Internal Server Error` on duplication or write error: `{"message": "File upload failed: <error details>"}`

* **Store Local File directly**
  * **POST** `/api/files/store-local`
  * **Parameters:** `filePath` (String, required)
  * **Response:** `200 OK` with storage target message.

* **Retrieve All Ingested Files**
  * **GET** `/api/files/all`
  * **Response:** `200 OK` returning `List<FileInfo>` JSON array.

* **Retrieve Recent Ingests**
  * **GET** `/api/files/recent`
  * **Response:** `200 OK` returning the last 10 sorted `List<FileInfo>` entries.

* **Search Indexed Files**
  * **GET** `/api/files/search`
  * **Query Parameters:**
    * `query` (String, required): Term to search inside file names or descriptions.
    * `category` (String, optional): Filter by category name.
    * `subCategory` (String, optional): Filter by subcategory name.
    * `fileType` (String, optional): Filter by file extension type.
    * `dateFrom` (Date, ISO 8601, optional): Filter files uploaded after this date.
    * `dateTo` (Date, ISO 8601, optional): Filter files uploaded before this date.
  * **Response:** `200 OK` returning filtered `List<FileInfo>` JSON array.

* **Inspect Storage Telemetry**
  * **GET** `/api/files/storage-stats`
  * **Response:** `200 OK` with disk space statistics:
    ```json
    {
      "totalSpace": 256000000000,
      "freeSpace": 120000000000,
      "organizedSize": 3612500,
      "uploadsSize": 1548200,
      "organizedPath": "C:\\path\\to\\organized",
      "uploadsPath": "C:\\path\\to\\uploads"
    }
    ```

* **Open File Location on Desktop**
  * **POST** `/api/files/metadata/{id}/open-location`
  * **Response:** `200 OK` (Launches Windows Explorer pointing directly to the file).

* **Launch / Run Local File**
  * **POST** `/api/files/metadata/{id}/run`
  * **Response:** `200 OK` (Launches the local file using the system's default handler).

---

### Category Master API (`/api/categories`)

* **List Categories & Subcategories**
  * **GET** `/api/categories`
  * **Response:** `List<Category>` containing nested subcategories lists.

* **Create Category**
  * **POST** `/api/categories`
  * **Parameters:** `name` (String, required)

* **Update Category**
  * **PUT** `/api/categories/{id}`
  * **Parameters:** `name` (String, required)

* **Delete Category**
  * **DELETE** `/api/categories/{id}`

* **Create Subcategory**
  * **POST** `/api/categories/{id}/subcategories`
  * **Parameters:** `name` (String, required)

* **Update Subcategory**
  * **PUT** `/api/categories/subcategories/{id}`
  * **Parameters:** `name` (String, required)

* **Delete Subcategory**
  * **DELETE** `/api/categories/subcategories/{id}`

---

### System Backup API (`/api/backup`)

* **Retrieve Backup History**
  * **GET** `/api/backup/history`
  * **Response:** `200 OK` with a JSON list of past `BackupRecord` structures.

* **Start Cold Backup**
  * **POST** `/api/backup/create`
  * **Response:** `200 OK` returning success string `Backup created at: backups/backup_[timestamp]`.

* **WebSocket Progress Tunnel**
  * **Protocol:** WebSocket (`ws://localhost:8080/progress`)
  * **Description:** Emits textual status events from the server during backup execution to keep the UI terminal updated dynamically.
