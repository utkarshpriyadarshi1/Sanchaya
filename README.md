# e-Dastavej Document Management System

e-Dastavej is a secure, local-first document management system designed to organize, index, and archive local files. It utilizes a hybrid desktop client-server architecture to provide a native app experience while leveraging local system resources.

---

## Architecture Overview

* **Frontend Client (Tauri + React + Vanilla CSS / Tailwind):** A lightweight desktop window rendering a React user interface, compiled via Rust into a native OS wrapper.
* **Backend Service (Spring Boot 3 + Spring Data JPA + SQLite):** A lightweight JVM-based background service managing file directory structures, metadata indexation, and content deduplication.
* **Mock Sandbox Mode:** If the frontend is launched without the Java service running, the React app automatically falls back to an interactive mock environment, allowing design iteration and UI validation out-of-the-box.

---

## Directory Structure

```text
e-dastavej/
├── backend/                  # Spring Boot 3 & SQLite database project
│   ├── src/                  # Java source files (controller, service, repository, model)
│   ├── sql/                  # SQLite database table schema setups
│   └── pom.xml               # Maven configuration
├── frontend/                 # Tauri desktop shell & React UI client
│   ├── src-tauri/            # Tauri desktop configuration & Rust project wrapper
│   ├── src/                  # React & Tailwind UI components
│   └── package.json          # Node.js configuration
├── docs/                     # Comprehensive architecture & user documentation
└── dev.bat / dev.sh          # One-click concurrent environment launchers
```

---

## Prerequisites

To run or build e-Dastavej locally, ensure you have the following installed:
* **Java Development Kit (JDK) 17 or higher**
* **Apache Maven 3.6+**
* **Node.js 18+ and npm**
* **Rust compiler & Cargo** (Required only for compilation of the Tauri native wrapper; not required for mock frontend development)

---

## Getting Started

### Quick Start (Concurrent Development)

The easiest way to start both backend and frontend development servers concurrently is by running the root helper scripts:

**On Windows:**
```cmd
.\dev.bat
```

**On macOS/Linux:**
```bash
chmod +x dev.sh
./dev.sh
```

---

### Step-by-Step Launch

If you prefer to launch the layers individually:

#### Step 1: Launch the Backend Service
The backend creates and updates the SQLite database `file_metadata.db` locally in the backend root directory.
```bash
cd backend
mvn spring-boot:run
```
The REST API server will run on `http://localhost:8080`.

#### Step 2: Start the Tauri Desktop Client
The Tauri client compiles the Rust wrapper and serves the React dashboard interface.
```bash
cd frontend
npm install
npm run tauri dev
```
A native application window will display the React Workstation interface.

*Note: If the backend service is offline, the client will warn you in the console log and run in **Mock Sandbox Mode**.*

---

## Core Features

- **Auto-Deduplication:** Computes SHA-256 hashes of files before archiving to prevent duplicate documents on disk, preserving storage.
- **Unified Folder Hierarchy:** Automatically structures archived files on disk under `organized/{file_type}/{year}/{month}/{filename}`.
- **Relational Classifications:** Organizes documents by custom categories and subcategories created via the Category Master.
- **Smart Directory Search:** Instantly queries metadata, categories, extensions, and date ranges in SQLite.
- **System Backups:** Real-time physical storage cold-backups with active websocket progress telemetry.

---

## Documentation

For deep dives into codebase structure and usage guides:
* [Architecture Guide](docs/ARCHITECTURE.md) — Directory trees, DB schemas, and REST/WebSocket API endpoints.
* [User Guide](docs/USER_GUIDE.md) — Step-by-step feature usage, troubleshooting, and setups.
* [Feature Registry](docs/FEATURES_STATUS.md) — Detailed list of implemented and roadmap features.