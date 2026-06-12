# e-Patra - Local-First Document Organizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: Cross-Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](#supported-platforms--devices)
[![Framework: Tauri v1.5](https://img.shields.io/badge/Framework-Tauri%20v1.5-orange.svg)](https://tauri.app/)
[![Backend: Spring Boot 3](https://img.shields.io/badge/Backend-Spring%20Boot%203-green.svg)](https://spring.io/projects/spring-boot)

e-Patra is a secure, local-first document management system designed to organize, index, and archive local files. It utilizes a hybrid desktop client-server architecture to provide a native app experience while leveraging local system resources.

---

## Supported Platforms & Devices

e-Patra is designed to be highly portable and compatible across a range of desktop platforms and hardware architectures:

* **Supported Operating Systems:**
  * **Windows:** Windows 10 and 11 (x86_64, ARM64)
  * **macOS:** macOS Catalina (10.15) and newer (Intel x86_64 & Apple Silicon ARM64)
  * **Linux:** Major distributions like Ubuntu, Debian, Fedora, Arch Linux (x86_64, ARM64)
* **Supported Devices:**
  * Standard Workstations, Laptops, and Local Servers.
  * Standalone single-user desktop terminals or shared local network computers (using a shared database or network path).

---

## Standalone vs. Web Portal Topology

e-Patra is architected as a **local-first standalone desktop application** to guarantee privacy, performance, and low-latency offline document manipulation. However, its modular architecture makes it flexible:

1. **Standalone Desktop Client (Primary):**
   The Tauri client bundles the React SPA and launches a dedicated native OS window. It communicates locally with the embedded JVM background service. The document database (SQLite) and file store reside strictly on the user's hard drive.
2. **Web Portal Extension (Adaptable):**
   Because the backend runs a lightweight REST API (Spring Boot) and provides real-time WebSocket messaging on standard port `8080`, the React client can easily be compiled for standard web deployment (`npm run build`). The backend can be hosted on a local intranet server, enabling multi-user web portal access to a shared document archive.

---

## Architecture Overview

* **Frontend Client (Tauri + React + Vanilla CSS / Tailwind):** A lightweight desktop window rendering a React user interface, compiled via Rust into a native OS wrapper.
* **Backend Service (Spring Boot 3 + Spring Data JPA + SQLite):** A lightweight JVM-based background service managing file directory structures, metadata indexation, and content deduplication.
* **Mock Sandbox Mode:** If the frontend is launched without the Java service running, the React app automatically falls back to an interactive mock environment, allowing design iteration and UI validation out-of-the-box.

---

## Directory Structure

```text
e-Patra/
├── backend/                  # Spring Boot 3 & SQLite database project
│   ├── src/                  # Java source files (controller, service, repository, model)
│   ├── sql/                  # SQLite database table schema setups
│   └── pom.xml               # Maven configuration
├── frontend/                 # Tauri desktop shell & React UI client
│   ├── src-tauri/            # Tauri desktop configuration & Rust project wrapper
│   ├── src/                  # React & Tailwind UI components
│   └── package.json          # Node.js configuration
├── builder/                  # Cross-platform build and packaging scripts
│   ├── build.js              # Node.js cross-platform build runner
│   ├── clean.js              # Node.js cross-platform workspace cleaner
│   ├── build.bat / build.sh  # OS-specific production packagers
│   ├── clean.bat / clean.sh  # OS-specific workspace cleaners
│   ├── increment_version.py  # Automation tool for version bumps
│   └── setup-cert.ps1        # Windows self-signed certificate generator
├── docs/                     # Comprehensive architecture & user documentation
│   ├── architecture-overview.md
│   ├── database-schema.md
│   ├── development-phases.md
│   └── scalability-deployment.md
├── schema/                   # Database initialization models
│   ├── data.sql              # Static assets and template data
│   └── schema.sql
├── build.bat / build.sh      # Root wrapper scripts for packaging (delegators)
├── clean.bat / clean.sh      # Root wrapper scripts for workspace cleanup (delegators)
└── dev.bat / dev.sh          # One-click concurrent environment launchers
```

---

## Prerequisites

To run or build e-Patra locally, ensure you have the following installed:
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

## Packaging and Distribution

To compile production-ready installers and packages:

* **Cross-Platform Node Script (Recommended):**
  Ensure you have Node.js and Cargo installed, then run:
  ```bash
  node builder/build.js
  ```
  This will package the Java backend, run Tauri version adjustments, and output native desktop installers.
* **On Windows:**
  Run `.\build.bat` in the root (delegates to `builder/build.bat`).
* **On macOS/Linux:**
  Run `./build.sh` in the root (delegates to `builder/build.sh`).

---

## Cleaning the Workspace

To remove Maven targets and Rust compiler cargo builds to free disk space:

* **Cross-Platform Node Script (Recommended):**
  ```bash
  node builder/clean.js
  ```
* **On Windows:**
  Run `.\clean.bat` in the root.
* **On macOS/Linux:**
  Run `./clean.sh` in the root.

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
* [Architecture Overview](docs/architecture-overview.md) — Directory trees, topologies, and REST/WebSocket API endpoints.
* [Database Schema](docs/database-schema.md) — Database configuration, tables, fields, and constraints.
* [Development Phases](docs/development-phases.md) — Detailed list of implemented and roadmap features.
* [Scalability & Deployment](docs/scalability-deployment.md) — Package compilation guides, Windows certificates, and scalability configurations.
* [Contributing Guidelines](CONTRIBUTING.md) — Open source development guidelines.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.