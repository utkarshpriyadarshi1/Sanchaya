# e-Dastavej User Guide

Welcome to **e-Dastavej**, a local-first desktop document management system designed to run on a single workstation or shared network drive.

---

## Operating Modes

e-Dastavej dynamically operates in one of two modes depending on backend availability:

1. **Live Local Mode:**
   * **When it occurs:** The Java backend server is running on `http://localhost:8080`.
   * **Capabilities:** Files are physically ingested, duplicated records are blocked using SHA-256 hashes, searches read from the local SQLite database, and real-time backups are fully executed.
   
2. **Mock Sandbox Mode:**
   * **When it occurs:** The frontend is started but the backend service is offline.
   * **Capabilities:** The application automatically falls back to a sandbox environment using your web browser's `localStorage` state. You can still test UI navigation, create categories/subcategories, simulate file uploads, and trigger simulated backups. This mode is excellent for quick mock presentations or UI design experiments.

---

## Getting Started

### 1. Launch the Environment
You can launch both the frontend and backend concurrently.

**On Windows:**
Double-click or run `.\dev.bat` from your command line.

**On macOS/Linux:**
Run `./dev.sh` from the project root.

---

## Standard Workflows

### 1. Set Up Classifications (Category Master)
Before archiving documents, define your file taxonomy:
1. Navigate to the **Category Master** tab in the sidebar.
2. In the **Create New Category** card, type the category name (e.g. `Finance`, `Legal`) and click **Create**.
3. Locate the new category in the registry list, type a subcategory name (e.g. `Invoices`, `Contracts`) in the input box, and click **Add**.
4. You can edit category/subcategory names or delete empty entries directly by using the edit pencil or trash icons.

### 2. Ingesting Documents
To archive a file on your local workstation:
1. Go to the **Ingest Document** tab.
2. Drag and drop a document file into the dashed box, or click the box to browse your folders.
3. Select the target **Category** and **Subcategory** from the dropdowns.
4. Input a brief **Description** or search tags.
5. Click **Index and Store File**.
   * *Under the hood:* The system checks the file content signature. If the same document content has already been uploaded, the system throws a duplicate warning and cancels the write action to protect disk space.

### 3. Searching the Archive
To locate stored documents:
1. Navigate to the **Search Index** tab.
2. Enter terms in the query input to search filenames or description tags.
3. Narrow down results using the dropdown filters:
   * **Category / Subcategory**
   * **File Type** (PDF, Images, Word documents)
4. Stored documents can be launched immediately using the **Open File** action.

### 4. Navigating the Workspace (Workstation Explorer)
To review files on disk:
1. Go to the **Workstation Explorer** tab.
2. The left panel shows the structured `organized/` folder tree reflecting the physical layout on your disk. Expand folders to navigate down to specific months.
3. Select an item in the tree to display full details (relative storage path, original import path, file size, format extension, and SHA-256 hash).
4. Click **Open Location** to open the OS folder with the file highlighted.
5. Click **Run Local File** to launch the file using the default OS system application.

### 5. Running Backups
To create physical backups of your repository:
1. Go to the **System Backup** tab.
2. Click **Start Full Backup**.
3. The **WebSocket Progress Log** console streams live server messages showing folder creation and file transfer progress.
4. Once completed, a successful backup record will be logged in the **Backup Registry History** column.

---

## Troubleshooting

### Connection Status Warns "Disconnected / Mock Mode"
* **Cause:** The Spring Boot backend service is not running on port `8080`.
* **Fix:** Make sure to run `.\dev.bat` (or execute `mvn spring-boot:run` manually in the `backend/` directory) to start the Java server. Then click the sync rotate icon in the sidebar connection card.

### System File Execution Fails
* **Cause:** The physical file was deleted, modified outside of the application, or the workstation lacks default file association handlers.
* **Fix:** Check the relative path in the **Workstation Explorer** details panel. If the file has been moved, re-ingest the document.
