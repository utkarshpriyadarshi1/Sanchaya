# Scalability & Deployment Guide

This document describes how to package, deploy, and scale the **e-Patra Document Management System** across standard desktop environments, network configurations, and intranet architectures.

---

## Production Packaging Workflow

e-Patra utilizes a multi-step builder script to bundle the Java service and Tauri client:

1. **Verify Prerequisites:** Java JDK 17+, Maven 3.6+, Node.js 18+, and Rust/Cargo must be installed.
2. **Execute build runner:**
   - **Cross-Platform (Node.js):** `node builder/build.js`
   - **Windows:** `.\build.bat` (calls `builder/build.bat`)
   - **macOS/Linux:** `./build.sh` (calls `builder/build.sh`)
3. **Compilation Pipeline:**
   - Maven compiles `backend/pom.xml` and packages `e-patra-1.0-SNAPSHOT.jar`.
   - Node builds React frontend static files.
   - Cargo compiles the Tauri native desktop wrapper, embedding the frontend assets and backend binary dependencies into the native executable.
   - Generates native platform installers (e.g., `.msi` for Windows, `.dmg` for macOS, `.deb` for Linux).

---

## Code Signing & Certificate Configuration (Windows)

Windows Defender/SmartScreen flags unsigned executable binaries. Tauri requires a developer certificate for production packaging:

1. Open PowerShell as Administrator.
2. Run the certificate setup script:
   ```powershell
   PowerShell -ExecutionPolicy Bypass -File .\builder\setup-cert.ps1
   ```
3. **Actions Performed:**
   - Generates a local self-signed Code Signing Certificate in the User Personal Store.
   - Exports the certificate as `certs/developer.pfx` (secured with standard password `patra123`).
   - Automatically writes the certificate thumbprint signature to `frontend/src-tauri/tauri.conf.json`.

*Note: For official workstation distribution, import the generated PFX file to the Trusted Root Certification Authorities list on target machines, or sign the application using a commercial Certificate Authority (CA).*

---

## Supported Operating Environments

- **Windows:** Windows 10 & 11 (Supports x86_64, ARM64 builds via WiX Toolset).
- **macOS:** macOS 10.15 (Catalina) and newer (Supports Apple Silicon and Intel x86_64 architectures).
- **Linux:** Ubuntu, Debian, Fedora, Arch Linux (Outputs `.deb` and `AppImage` formats).

---

## Scalability Topologies

While e-Patra is configured for local-first standalone workstations, its decoupled architecture supports multiple scaling paths:

### 1. Standalone Desktop Deployment (Default)
- **Deployment:** Installed directly on a workstation.
- **Data storage:** SQLite file `file_metadata.db` and the `organized/` folder tree reside entirely on the local disk.
- **Pros:** Zero configuration, maximum security/privacy, offline accessibility.

### 2. Shared Network Storage (Local LAN)
- **Deployment:** e-Patra is installed on several computers connected to the same Local Area Network.
- **Configuration:**
  - Map the database path in `backend/src/main/resources/application.yml` to a shared network path:
    ```yaml
    spring:
      datasource:
        url: jdbc:sqlite://[NetworkSharePath]/file_metadata.db
    ```
  - Map the ingestion root directory to the same mapped network share.
- **Pros:** Unified index across several local computers.
- **Cons:** SQLite lock contentions can occur if multiple users perform concurrent document writes.

### 3. Centrally Hosted Local Intranet Server
- **Deployment:** The Spring Boot backend runs on a dedicated server connected to the intranet. The React client runs in standard web browsers.
- **Architecture Flow:**
  - Build the React UI for standard web server environments using `npm run build` in the `frontend` folder.
  - Deploy the compiled HTML/CSS/JS frontend to a web server (e.g., Nginx or Apache).
  - Configure the frontend's API client endpoints to point to the central server's port `8080`.
- **Database Scaling:** If write traffic scales, update the backend datasource settings in `application.yml` to point to a central PostgreSQL database instead of SQLite:
  ```yaml
  spring:
    datasource:
      url: jdbc:postgresql://localhost:5432/epatra
      driver-class-name: org.postgresql.Driver
  ```
  Spring Data JPA automatically translates mapping queries to PostgreSQL format, allowing dozens of concurrent uploads.
