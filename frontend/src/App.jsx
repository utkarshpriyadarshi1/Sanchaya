import React, { useState, useEffect } from "react";

function App() {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem("epatra_preferences");
    return saved ? JSON.parse(saved) : {
      defaultTab: "dashboard",
      autoBackup: false,
      backupInterval: "24",
      dedupStrategy: "sha256",
      storageRoot: "C:\\Users\\utkar\\Desktop\\Projects\\e-patra\\organized",
      ingestTmp: "C:\\Users\\utkar\\Desktop\\Projects\\e-patra\\uploads"
    };
  });

  const [activeTab, setActiveTab] = useState(() => {
    return preferences.defaultTab || "dashboard";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("epatra_theme") || "dark";
  });

  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [appLogs, setAppLogs] = useState(() => {
    return [
      { timestamp: new Date().toISOString(), type: "info", message: "e-Patra Workstation Client initialized successfully." },
      { timestamp: new Date().toISOString(), type: "info", message: "Loaded preferences and active theme from local storage." }
    ];
  });

  const addLog = (type, message) => {
    const timestamp = new Date().toISOString();
    setAppLogs(prev => [{ timestamp, type, message }, ...prev]);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    addLog("info", `Navigation route changed view to: ${tab.toUpperCase()}`);
  };

  useEffect(() => {
    localStorage.setItem("epatra_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    addLog("info", `Workspace window theme switched to: ${theme.toUpperCase()} mode`);
  }, [theme]);

  const [backendConnected, setBackendConnected] = useState(false);
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);

  // Workstation and Backup State
  const [backupHistory, setBackupHistory] = useState([]);
  const [backupLogs, setBackupLogs] = useState([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Storage Stats & Physical File Metadata
  const [storageStats, setStorageStats] = useState(null);
  const [fileMetadata, setFileMetadata] = useState([]);
  const [selectedFileMeta, setSelectedFileMeta] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({}); // key: folderPath, value: boolean

  // Upload Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [filterType, setFilterType] = useState("");

  // Category Master Form State
  const [newCatName, setNewCatName] = useState("");
  const [newSubName, setNewSubName] = useState({}); // key: categoryId, value: subcategoryName
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingSubId, setEditingSubId] = useState(null);
  const [editingSubName, setEditingSubName] = useState("");

  // Fetch functions
  const fetchCategories = () => {
    fetch("http://localhost:8080/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  };

  const fetchFiles = () => {
    fetch("http://localhost:8080/api/files/all")
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(err => console.error("Error fetching files:", err));
  };

  const fetchBackupHistory = () => {
    fetch("http://localhost:8080/api/backup/history")
      .then(res => res.json())
      .then(data => setBackupHistory(data))
      .catch(err => console.error("Error fetching backup history:", err));
  };

  const fetchStorageStats = () => {
    fetch("http://localhost:8080/api/files/storage-stats")
      .then(res => res.json())
      .then(data => setStorageStats(data))
      .catch(err => console.error("Error fetching storage stats:", err));
  };

  const fetchFileMetadata = () => {
    fetch("http://localhost:8080/api/files/metadata")
      .then(res => res.json())
      .then(data => setFileMetadata(data))
      .catch(err => console.error("Error fetching file metadata:", err));
  };

  const syncAllData = () => {
    addLog("info", "Syncing all workspace databases and telemetry metrics...");
    fetchCategories();
    fetchFiles();
    fetchBackupHistory();
    fetchStorageStats();
    fetchFileMetadata();
  };

  // Test backend connectivity and fetch initial data
  useEffect(() => {
    addLog("info", "Pinging local Spring Boot REST API service...");
    fetch("http://localhost:8080/api/files/all", { method: "HEAD" })
      .then(() => {
        setBackendConnected(true);
        addLog("success", "Connected to local Spring Boot API server on port 8080 (SQLite active).");
        syncAllData();
      })
      .catch(() => {
        setBackendConnected(false);
        addLog("warning", "Local backend host offline. Switched workstation registry to Mock Sandbox.");
        // Fallback mockup data in case backend is offline
        setCategories([
          { id: 1, name: "Finance", subCategories: [{ id: 1, name: "Reports" }, { id: 2, name: "Invoices" }] },
          { id: 2, name: "Operations", subCategories: [{ id: 3, name: "Blueprints" }] },
          { id: 3, name: "Legal", subCategories: [{ id: 4, name: "Contracts" }] }
        ]);
        setFiles([
          { id: 1, fileName: "annual_report_2026.pdf", fileType: "application/pdf", fileSize: 1048576, category: "Finance", subCategory: "Reports", uploadDate: "2026-05-25" },
          { id: 2, fileName: "office_layout.png", fileType: "image/png", fileSize: 2048576, category: "Operations", subCategory: "Blueprints", uploadDate: "2026-05-24" },
          { id: 3, fileName: "terms_and_conditions.docx", fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileSize: 512000, category: "Legal", subCategory: "Contracts", uploadDate: "2026-05-23" }
        ]);
        setBackupHistory([
          { id: 1, backupPath: "backups/backup_1716682490123", timestamp: "2026-05-25T12:00:00", status: "SUCCESS" }
        ]);
        setStorageStats({
          totalSpace: 256000000000, // 256 GB
          freeSpace: 120000000000,  // 120 GB
          organizedSize: 3612500,   // ~3.6 MB
          uploadsSize: 1548200,     // ~1.5 MB
          organizedPath: "C:\\Users\\utkar\\Desktop\\Projects\\e-patra\\organized",
          uploadsPath: "C:\\Users\\utkar\\Desktop\\Projects\\e-patra\\uploads"
        });
        setFileMetadata([
          { id: 1, originalPath: "C:\\Downloads\\report.pdf", storedPath: "organized/pdf/2026/05/annual_report_2026.pdf", fileType: "pdf", year: "2026", month: "05", fileSize: 1048576, hash: "a3f5b9021876cd49b387ea1023a7" },
          { id: 2, originalPath: "C:\\Pictures\\layout.png", storedPath: "organized/png/2026/05/office_layout.png", fileType: "png", year: "2026", month: "05", fileSize: 2048576, hash: "f928e10398ab76d203cfeb9272d1" }
        ]);
      });
  }, []);



  // WebSocket Backup progress handler
  const handleStartBackup = () => {
    addLog("info", "Starting document physical storage cold backup pack...");
    setIsBackingUp(true);
    setBackupLogs([
      "[Client] Initializing document backup routine...",
      "[Client] Establishing WebSocket log sync at ws://localhost:8080/progress..."
    ]);

    if (!backendConnected) {
      // Mock Mode Backup
      setTimeout(() => {
        setBackupLogs(prev => [
          ...prev,
          "[Server] Connected to local backup broker successfully.",
          "[Server] Created destination folder organized/backups/backup_mock_1716682490.",
          "[Server] Hashing files for verification...",
          "[Server] Copying uploads/annual_report_2026.pdf ... Done.",
          "[Server] Copying uploads/office_layout.png ... Done.",
          "[Server] Database indices successfully packed.",
          "[Server] Backup completed successfully.",
          "[Client] WebSocket logs connection closed."
        ]);
        const mockRecord = {
          id: Date.now(),
          backupPath: "backups/backup_mock_" + Math.floor(Date.now() / 1000),
          timestamp: new Date().toISOString(),
          status: "SUCCESS"
        };
        setBackupHistory([mockRecord, ...backupHistory]);
        setIsBackingUp(false);
        addLog("success", "Workstation cold backup pack created successfully (Mock Mode).");
      }, 2000);
      return;
    }

    const ws = new WebSocket("ws://localhost:8080/progress");

    ws.onopen = () => {
      setBackupLogs(prev => [...prev, "[Client] WebSocket connection established. Starting service..."]);
      
      fetch("http://localhost:8080/api/backup/create", {
        method: "POST"
      })
        .then(res => res.text())
        .then(result => {
          setBackupLogs(prev => [...prev, `[Result] ${result}`]);
          setIsBackingUp(false);
          fetchBackupHistory();
          fetchStorageStats();
          addLog("success", `Workspace cold backup completed: ${result}`);
        })
        .catch(err => {
          setBackupLogs(prev => [...prev, `[Error] Service request failed: ${err.message}`]);
          setIsBackingUp(false);
          addLog("error", `Backup pipeline failed: ${err.message}`);
        });
    };

    ws.onmessage = (event) => {
      setBackupLogs(prev => [...prev, `[Server] ${event.data}`]);
    };

    ws.onerror = () => {
      setBackupLogs(prev => [...prev, "[Error] WebSocket communication failure."]);
      addLog("error", "WebSocket connection failure during backup.");
    };

    ws.onclose = () => {
      setBackupLogs(prev => [...prev, "[Client] WebSocket socket pipeline closed."]);
      setIsBackingUp(false);
      fetchBackupHistory();
      addLog("info", "WebSocket sync tunnel closed.");
    };
  };

  // Category CRUD Handlers
  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (!backendConnected) {
      // Mock mode
      const newCat = {
        id: Date.now(),
        name: newCatName.trim(),
        subCategories: []
      };
      setCategories([...categories, newCat]);
      addLog("success", `Created category classification: ${newCat.name} (Mock Mode)`);
      setNewCatName("");
      return;
    }

    const params = new URLSearchParams();
    params.append("name", newCatName.trim());

    fetch("http://localhost:8080/api/categories", {
      method: "POST",
      body: params
    })
      .then(res => res.json())
      .then(() => {
        addLog("success", `Created category classification: ${newCatName.trim()}`);
        setNewCatName("");
        fetchCategories();
      })
      .catch(err => {
        addLog("error", `Failed to create category: ${err.message}`);
        console.error("Error creating category:", err);
      });
  };

  const handleUpdateCategory = (id) => {
    if (!editingCatName.trim()) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => c.id === id ? { ...c, name: editingCatName.trim() } : c));
      addLog("success", `Renamed category ID ${id} to: ${editingCatName.trim()} (Mock Mode)`);
      setEditingCatId(null);
      setEditingCatName("");
      return;
    }

    const params = new URLSearchParams();
    params.append("name", editingCatName.trim());

    fetch(`http://localhost:8080/api/categories/${id}`, {
      method: "PUT",
      body: params
    })
      .then(() => {
        addLog("success", `Renamed category ID ${id} to: ${editingCatName.trim()}`);
        setEditingCatId(null);
        setEditingCatName("");
        fetchCategories();
      })
      .catch(err => {
        addLog("error", `Failed to update category: ${err.message}`);
        console.error("Error updating category:", err);
      });
  };

  const handleDeleteCategory = (id) => {
    if (!confirm("Are you sure you want to delete this category? All its subcategories will also be deleted.")) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.filter(c => c.id !== id));
      addLog("warning", `Deleted category ID: ${id} (Mock Mode)`);
      return;
    }

    fetch(`http://localhost:8080/api/categories/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        addLog("warning", `Deleted category ID: ${id}`);
        fetchCategories();
      })
      .catch(err => {
        addLog("error", `Failed to delete category: ${err.message}`);
        console.error("Error deleting category:", err);
      });
  };

  // Subcategory CRUD Handlers
  const handleCreateSubCategory = (catId) => {
    const subName = newSubName[catId];
    if (!subName || !subName.trim()) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => {
        if (c.id === catId) {
          return {
            ...c,
            subCategories: [...c.subCategories, { id: Date.now(), name: subName.trim() }]
          };
        }
        return c;
      }));
      addLog("success", `Created subcategory: ${subName.trim()} under category ID ${catId} (Mock Mode)`);
      setNewSubName({ ...newSubName, [catId]: "" });
      return;
    }

    const params = new URLSearchParams();
    params.append("name", subName.trim());

    fetch(`http://localhost:8080/api/categories/${catId}/subcategories`, {
      method: "POST",
      body: params
    })
      .then(() => {
        addLog("success", `Created subcategory: ${subName.trim()} under category ID ${catId}`);
        setNewSubName({ ...newSubName, [catId]: "" });
        fetchCategories();
      })
      .catch(err => {
        addLog("error", `Failed to create subcategory: ${err.message}`);
        console.error("Error creating subcategory:", err);
      });
  };

  const handleUpdateSubCategory = (subId) => {
    if (!editingSubName.trim()) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => ({
        ...c,
        subCategories: c.subCategories.map(s => s.id === subId ? { ...s, name: editingSubName.trim() } : s)
      })));
      addLog("success", `Renamed subcategory ID ${subId} to: ${editingSubName.trim()} (Mock Mode)`);
      setEditingSubId(null);
      setEditingSubName("");
      return;
    }

    const params = new URLSearchParams();
    params.append("name", editingSubName.trim());

    fetch(`http://localhost:8080/api/categories/subcategories/${subId}`, {
      method: "PUT",
      body: params
    })
      .then(() => {
        addLog("success", `Renamed subcategory ID ${subId} to: ${editingSubName.trim()}`);
        setEditingSubId(null);
        setEditingSubName("");
        fetchCategories();
      })
      .catch(err => {
        addLog("error", `Failed to update subcategory: ${err.message}`);
        console.error("Error updating subcategory:", err);
      });
  };

  const handleDeleteSubCategory = (subId) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => ({
        ...c,
        subCategories: c.subCategories.filter(s => s.id !== subId)
      })));
      addLog("warning", `Deleted subcategory ID: ${subId} (Mock Mode)`);
      return;
    }

    fetch(`http://localhost:8080/api/categories/subcategories/${subId}`, {
      method: "DELETE"
    })
      .then(() => {
        addLog("warning", `Deleted subcategory ID: ${subId}`);
        fetchCategories();
      })
      .catch(err => {
        addLog("error", `Failed to delete subcategory: ${err.message}`);
        console.error("Error deleting subcategory:", err);
      });
  };

  // File Upload Handler
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadStatus("Please select a file first.");
      addLog("warning", "File upload aborted: No file selected.");
      return;
    }
    if (!category) {
      setUploadStatus("Please select a category.");
      addLog("warning", "File upload aborted: No category specified.");
      return;
    }

    setUploadStatus("Uploading to local Spring Boot SQLite service...");
    addLog("info", `Initiating file ingest routine for: ${uploadFile.name}...`);

    if (!backendConnected) {
      // Mock Mode Upload
      setTimeout(() => {
        const newFile = {
          id: Date.now(),
          fileName: uploadFile.name,
          fileType: uploadFile.type || "unknown",
          fileSize: uploadFile.size,
          category: category,
          subCategory: subCategory || "General",
          uploadDate: new Date().toISOString().split('T')[0]
        };
        setFiles([newFile, ...files]);
        setUploadStatus("File successfully stored and indexed! (Mock Mode)");
        addLog("success", `Ingested resource: ${uploadFile.name} successfully (Mock Sandbox).`);
        setUploadFile(null);
        setDescription("");
        setSelectedCatId("");
        setCategory("");
        setSubCategory("");
      }, 1500);
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("subCategory", subCategory || "General");

    fetch("http://localhost:8080/api/files/upload", {
      method: "POST",
      body: formData
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Upload failed");
        }
        return res.json();
      })
      .then(() => {
        setUploadStatus("File successfully stored and indexed!");
        addLog("success", `Ingested resource: ${uploadFile.name} successfully and packed on disk.`);
        setUploadFile(null);
        setDescription("");
        setSelectedCatId("");
        setCategory("");
        setSubCategory("");
        fetchFiles();
        fetchStorageStats();
        fetchFileMetadata();
      })
      .catch(err => {
        setUploadStatus("Error uploading file: " + err.message);
        addLog("error", `Failed to ingest resource ${uploadFile.name}: ${err.message}`);
      });
  };

  // Live File Search
  const handleSearch = () => {
    if (!backendConnected) return;

    const params = new URLSearchParams();
    params.append("query", searchQuery);
    if (filterCategory) params.append("category", filterCategory);
    if (filterSubCategory) params.append("subCategory", filterSubCategory);
    if (filterType) params.append("fileType", filterType);

    fetch(`http://localhost:8080/api/files/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => setFiles(data))
      .catch(err => console.error("Search error:", err));
  };

  useEffect(() => {
    if (backendConnected) {
      handleSearch();
    }
  }, [searchQuery, filterCategory, filterSubCategory, filterType, backendConnected]);

  // Dropdown options helper
  const handleCategoryChange = (catId) => {
    setSelectedCatId(catId);
    if (catId === "") {
      setCategory("");
      setSubCategory("");
    } else {
      const catObj = categories.find(c => c.id === parseInt(catId));
      setCategory(catObj ? catObj.name : "");
      setSubCategory("");
    }
  };

  const selectedCatObj = categories.find(c => c.id === parseInt(selectedCatId));
  const availableSubCategories = selectedCatObj ? selectedCatObj.subCategories : [];

  const filterCatObj = categories.find(c => c.name === filterCategory);
  const filterSubCatsAvailable = filterCatObj ? filterCatObj.subCategories : [];

  // Directory Tree builder helper
  const buildDirectoryTree = () => {
    const tree = {};
    fileMetadata.forEach(meta => {
      const type = meta.fileType || "unknown";
      const year = meta.year || "unknown";
      const month = meta.month || "unknown";

      if (!tree[type]) tree[type] = {};
      if (!tree[type][year]) tree[type][year] = {};
      if (!tree[type][year][month]) tree[type][year][month] = [];

      tree[type][year][month].push(meta);
    });
    return tree;
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleOpenLocation = (id) => {
    fetch(`http://localhost:8080/api/files/metadata/${id}/open-location`, { method: "POST" })
      .then(res => {
        if (!res.ok) throw new Error("Could not open location");
      })
      .catch(err => console.error("Error opening location:", err));
  };

  const handleRunFile = (id) => {
    fetch(`http://localhost:8080/api/files/metadata/${id}/run`, { method: "POST" })
      .then(res => {
        if (!res.ok) throw new Error("Could not launch file");
      })
      .catch(err => console.error("Error launching file:", err));
  };

  // Metrics helper
  const totalSizeMB = files.reduce((acc, f) => acc + f.fileSize, 0) / 1024 / 1024;
  const dirTree = buildDirectoryTree();

  // Storage utilization variables
  const driveTotalGB = storageStats ? (storageStats.totalSpace / 1024 / 1024 / 1024).toFixed(1) : "0";
  const driveFreeGB = storageStats ? (storageStats.freeSpace / 1024 / 1024 / 1024).toFixed(1) : "0";
  const driveUsedGB = storageStats ? ((storageStats.totalSpace - storageStats.freeSpace) / 1024 / 1024 / 1024).toFixed(1) : "0";
  const driveUsedPercent = storageStats ? Math.round(((storageStats.totalSpace - storageStats.freeSpace) / storageStats.totalSpace) * 100) : 0;
  const localOrganizedSizeMB = storageStats ? (storageStats.organizedSize / 1024 / 1024).toFixed(2) : "0";
  const localUploadsSizeMB = storageStats ? (storageStats.uploadsSize / 1024 / 1024).toFixed(2) : "0";

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans select-none antialiased">
      
      {/* Workstation Desktop Titlebar */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between select-none">
        {/* Client Window Title */}
        <div className="text-xs font-semibold text-slate-400 tracking-wider flex items-center space-x-2">
          <i className="fa-solid fa-box-archive text-indigo-400 text-[11px]"></i>
          <span>e-Patra Desktop Workstation Client</span>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center space-x-2">
          {/* Host loopback context tag */}
          <div className="text-[10px] bg-slate-955 border border-slate-800/60 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold tracking-wide uppercase">
            Local Workstation
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-lg bg-slate-955 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-all cursor-pointer flex items-center justify-center h-7 w-7"
            title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {theme === "dark" ? (
              <i className="fa-solid fa-sun text-amber-500 text-[11px]"></i>
            ) : (
              <i className="fa-solid fa-moon text-indigo-400 text-[11px]"></i>
            )}
          </button>

          {/* Preferences Button */}
          <button
            onClick={() => setIsPrefOpen(true)}
            className="p-1.5 rounded-lg bg-slate-955 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-all cursor-pointer flex items-center justify-center h-7 w-7"
            title="Workstation Preferences"
          >
            <i className="fa-solid fa-sliders text-[11px]"></i>
          </button>

          {/* Help Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1.5 rounded-lg bg-slate-955 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-all cursor-pointer flex items-center justify-center h-7 w-7"
            title="Help & Documentation"
          >
            <i className="fa-solid fa-circle-question text-[11px]"></i>
          </button>

          {/* Live Logs Button */}
          <button
            onClick={() => setIsLogsOpen(true)}
            className="p-1.5 rounded-lg bg-slate-955 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition-all cursor-pointer flex items-center justify-center h-7 w-7"
            title="Application Live Logs"
          >
            <i className="fa-solid fa-terminal text-[11px]"></i>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-66 bg-slate-900/90 border-r border-slate-800 p-4 flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30 text-white">
                e
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">e-Patra</h1>
                <span className="text-xs text-slate-500 font-medium tracking-wide">DOCUMENT ORGANIZER</span>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => handleTabChange("dashboard")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-chart-line text-sm w-4 text-center"></i>
                <span className="text-sm">Workstation Monitor</span>
              </button>
              <button
                onClick={() => handleTabChange("explorer")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "explorer"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-folder-tree text-sm w-4 text-center"></i>
                <span className="text-sm">Workstation Explorer</span>
              </button>
              <button
                onClick={() => handleTabChange("search")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "search"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-magnifying-glass text-sm w-4 text-center"></i>
                <span className="text-sm">Search Index</span>
              </button>
              <button
                onClick={() => handleTabChange("upload")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "upload"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-file-import text-sm w-4 text-center"></i>
                <span className="text-sm">Ingest Document</span>
              </button>
              <button
                onClick={() => handleTabChange("categories")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "categories"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-tags text-sm w-4 text-center"></i>
                <span className="text-sm">Category Master</span>
              </button>

              <button
                onClick={() => handleTabChange("backup")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "backup"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <i className="fa-solid fa-database text-sm w-4 text-center"></i>
                <span className="text-sm">System Backup</span>
              </button>
            </nav>
          </div>

          {/* Connection Status Indicator */}
          <div className="bg-slate-850/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${backendConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <div className="text-xs">
                <div className="flex items-center space-x-1.5">
                  <p className="font-semibold text-slate-350">Local Backend</p>
                  {backendConnected && (
                    <button onClick={syncAllData} className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer" title="Force Sync Workspace">
                      <i className="fa-solid fa-rotate-right text-xs"></i>
                    </button>
                  )}
                </div>
                <p className="text-slate-500 text-[10px]">{backendConnected ? "Connected (Port 8080)" : "Disconnected (Mock Mode)"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-955/60 backdrop-blur-lg">
          
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Workstation Monitor
                </h2>
                <p className="text-slate-400 mt-1">Real-time telemetry of your local document database and physical storage partitions.</p>
              </div>

              {/* Workstation Storage Sizing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Physical Hard Drive Size Card */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-indigo-950/20 transition-all duration-300">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                      <span>Physical Workstation Storage</span>
                      <i className="fa-solid fa-hard-drive text-indigo-400 text-xs"></i>
                    </span>
                    <div className="flex items-baseline space-x-1.5 mt-2">
                      <span className="text-3xl font-black text-slate-100">{driveUsedGB}</span>
                      <span className="text-xs font-bold text-slate-500">/ {driveTotalGB} GB USED</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>{driveFreeGB} GB FREE</span>
                      <span>{driveUsedPercent}% UTILIZATION</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${driveUsedPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Local Folder Sizing Card */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl shadow-lg flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-indigo-950/20 transition-all duration-300">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                      <span>Workspace Directory Sizing</span>
                      <i className="fa-solid fa-folder-open text-indigo-400 text-xs"></i>
                    </span>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Organized Files</span>
                        <span className="text-xl font-bold text-indigo-400">{localOrganizedSizeMB} MB</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Temporary Ingests</span>
                        <span className="text-xl font-bold text-indigo-400">{localUploadsSizeMB} MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-550 border-t border-slate-850 pt-3 mt-4">
                    Files are indexed in a local-first portable registry.
                  </div>
                </div>

                {/* Diagnostics / Engine Card */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl shadow-lg flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-indigo-950/20 transition-all duration-300">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                      <span>Engine Diagnostics</span>
                      <i className="fa-solid fa-microchip text-indigo-400 text-xs"></i>
                    </span>
                    <div className="space-y-1.5 mt-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">DB System:</span>
                        <span className="font-semibold text-slate-350">SQLite 3 (Local File)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Deduplication:</span>
                        <span className="font-semibold text-emerald-400">ACTIVE (SHA-256)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Workstation Host:</span>
                        <span className="font-semibold text-slate-350">Windows (127.0.0.1)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">JVM Runtime:</span>
                        <span className="font-semibold text-slate-350">Java 21 OpenJDK</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-550 border-t border-slate-850 pt-3 mt-2 flex justify-between">
                    <span>Index Size: {files.length} records</span>
                    <span className="text-indigo-400 font-bold">SECURE LOOPBACK</span>
                  </div>
                </div>

              </div>

              {/* Absolute Directory Paths info */}
              {storageStats && (
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 font-mono text-[10px] text-slate-450 space-y-1 bg-gradient-to-r from-slate-950/20 to-transparent">
                  <div><span className="font-bold text-slate-500">ORGANIZED ROOT:</span> {storageStats.organizedPath}</div>
                  <div><span className="font-bold text-slate-500">INGEST TMP FOLDER:</span> {storageStats.uploadsPath}</div>
                </div>
              )}

              {/* Recent Files Table */}
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4">
                <h3 className="text-base font-bold mb-3 flex items-center">
                  <i className="fa-solid fa-clock-rotate-left text-indigo-400 mr-2 text-base"></i>
                  <span>Recent Workstation Document Changes</span>
                </h3>
                {files.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-350">
                      <thead className="bg-slate-900/70 text-slate-400 text-xs font-bold uppercase">
                        <tr>
                          <th className="py-2 px-3 rounded-l-xl">File Name</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Size</th>
                          <th className="py-2 px-3">Category</th>
                          <th className="py-2 px-3">Subcategory</th>
                          <th className="py-2 px-3 rounded-r-xl">Upload Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.slice(0, 8).map((file) => (
                          <tr key={file.id} className="border-b border-slate-800/30 hover:bg-slate-900/40 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-200">{file.fileName}</td>
                            <td className="py-2 px-3 font-mono text-xs text-slate-400">{file.fileType || "Unknown"}</td>
                            <td className="py-2 px-3">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium">
                                {file.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400">{file.subCategory || "General"}</td>
                            <td className="py-2 px-3 text-slate-500">
                              {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500">No indexed documents found. Use the **Ingest Document** tab to add files.</div>
                )}
              </div>
            </div>
          )}

          {/* Workstation Explorer Tab (Directory Browser) */}
          {activeTab === "explorer" && (
            <div className="space-y-4 animate-fadeIn h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Workstation Explorer
                </h2>
                <p className="text-slate-400 mt-1">Browse the physically organized folder structure of the workstation on your disk.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 flex-1 items-start">
                {/* Folder Directory Tree Panel */}
                <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 min-h-[480px] shadow-xl overflow-y-auto">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-850 mb-4 flex items-center space-x-1.5">
                    <i className="fa-solid fa-folder-tree text-indigo-400 mr-1.5"></i> <span>organized /</span>
                  </h3>

                  {Object.keys(dirTree).length > 0 ? (
                    <div className="space-y-3.5 font-sans">
                      
                      {/* File Type Folders */}
                      {Object.keys(dirTree).map(type => {
                        const typePath = type;
                        const isTypeExpanded = expandedFolders[typePath];
                        return (
                          <div key={type} className="space-y-1.5">
                            <div
                              onClick={() => toggleFolder(typePath)}
                              className="flex items-center space-x-2 text-sm font-bold text-slate-200 hover:text-indigo-400 cursor-pointer select-none py-1 px-2 hover:bg-slate-850/40 rounded-lg transition-colors"
                            >
                              <i className={`fa-solid ${isTypeExpanded ? "fa-folder-open text-indigo-400" : "fa-folder text-indigo-500"} mr-1 text-xs`}></i>
                              <span>{type}</span>
                            </div>

                            {/* Year Folders */}
                            {isTypeExpanded && (
                              <div className="pl-6 space-y-1.5 border-l border-slate-850 ml-3">
                                {Object.keys(dirTree[type]).map(year => {
                                  const yearPath = `${type}/${year}`;
                                  const isYearExpanded = expandedFolders[yearPath];
                                  return (
                                    <div key={year} className="space-y-1.5">
                                      <div
                                        onClick={() => toggleFolder(yearPath)}
                                        className="flex items-center space-x-2 text-xs font-bold text-slate-350 hover:text-indigo-400 cursor-pointer select-none py-1 px-2 hover:bg-slate-850/40 rounded-lg transition-colors"
                                      >
                                        <i className={`fa-solid ${isYearExpanded ? "fa-folder-open text-indigo-400" : "fa-folder text-indigo-550"} mr-1 text-[10px]`}></i>
                                        <span>{year}</span>
                                      </div>

                                      {/* Month Folders */}
                                      {isYearExpanded && (
                                        <div className="pl-6 space-y-1 border-l border-slate-850 ml-3">
                                          {Object.keys(dirTree[type][year]).map(month => {
                                            const monthPath = `${type}/${year}/${month}`;
                                            const isMonthExpanded = expandedFolders[monthPath];
                                            return (
                                              <div key={month} className="space-y-1">
                                                <div
                                                  onClick={() => toggleFolder(monthPath)}
                                                  className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-400 cursor-pointer select-none py-0.5 px-2 hover:bg-slate-850/40 rounded-lg transition-colors"
                                                >
                                                  <i className={`fa-solid ${isMonthExpanded ? "fa-folder-open text-indigo-455" : "fa-folder text-indigo-600"} mr-1 text-[9px]`}></i>
                                                  <span>{month}</span>
                                                </div>

                                                {/* File Items */}
                                                {isMonthExpanded && (
                                                  <div className="pl-5 space-y-0.5 border-l border-slate-850 ml-2">
                                                    {dirTree[type][year][month].map(meta => (
                                                      <div
                                                        key={meta.id}
                                                        onClick={() => setSelectedFileMeta(meta)}
                                                        className={`flex items-center space-x-1.5 text-xs py-1 px-2.5 rounded-lg cursor-pointer transition-colors ${
                                                          selectedFileMeta?.id === meta.id
                                                            ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-medium"
                                                            : "text-slate-450 hover:bg-slate-850/50 hover:text-slate-300 border border-transparent"
                                                        }`}
                                                      >
                                                        <i className="fa-solid fa-file-lines text-slate-450 mr-1.5 text-[9px]"></i>
                                                        <span className="truncate max-w-[150px]">{meta.storedPath.split("/").pop()}</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs italic">
                      No physically organized files indexed yet.<br/>
                      Ingest files to generate disk structure.
                    </div>
                  )}
                </div>

                {/* File Details Panel */}
                <div className="md:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 min-h-[480px] shadow-xl flex flex-col justify-between">
                  {selectedFileMeta ? (
                    <div className="space-y-5 animate-fadeIn">
                      <div className="pb-3 border-b border-slate-800">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Local Resource Metadata
                        </span>
                        <h4 className="text-lg font-bold text-slate-100 mt-2 break-all">
                          {selectedFileMeta.storedPath.split("/").pop()}
                        </h4>
                      </div>

                      <div className="space-y-3.5 text-xs text-slate-350">
                        <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Stored Path (Relative)</span>
                          <span className="font-mono text-indigo-400 break-all">{selectedFileMeta.storedPath}</span>
                        </div>
                        <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Original Path</span>
                          <span className="font-mono text-slate-400 break-all">{selectedFileMeta.originalPath}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                            <span className="text-[10px] text-slate-550 block uppercase font-bold mb-0.5">File Sizing</span>
                            <span className="font-semibold text-slate-200">{(selectedFileMeta.fileSize / 1024 / 1024).toFixed(3)} MB</span>
                          </div>
                          <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                            <span className="text-[10px] text-slate-550 block uppercase font-bold mb-0.5">Format Extension</span>
                            <span className="font-semibold uppercase text-slate-200">{selectedFileMeta.fileType}</span>
                          </div>
                        </div>
                        <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                          <span className="text-[10px] text-slate-550 block uppercase font-bold mb-1">Deduplication Signature (SHA-256)</span>
                          <span className="font-mono text-slate-400 break-all">{selectedFileMeta.hash}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-850 flex justify-end space-x-3">
                        <button 
                          onClick={() => handleOpenLocation(selectedFileMeta.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-folder-closed"></i>
                          <span>Open Location</span>
                        </button>
                        <button 
                          onClick={() => handleRunFile(selectedFileMeta.id)}
                          className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-655/10 flex items-center space-x-1.5 cursor-pointer"
                        >
                          <i className="fa-solid fa-play text-[10px]"></i>
                          <span>Run Local File</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-550 flex-1 space-y-2">
                      <i className="fa-solid fa-folder-open text-slate-600 text-3xl mb-2"></i>
                      <p className="text-xs italic">Select an organized node from the directory tree to inspect workstation resource mappings.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Search Document Index
                </h2>
                <p className="text-slate-400 mt-1">Queries the local SQLite database for matching metadata and index text.</p>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl">
                <input
                  type="text"
                  placeholder="Search filenames or contents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-200"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setFilterSubCategory(""); }}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={filterSubCategory}
                  onChange={(e) => setFilterSubCategory(e.target.value)}
                  disabled={!filterCategory}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300 disabled:opacity-40"
                >
                  <option value="">All Subcategories</option>
                  {filterSubCatsAvailable.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
                >
                  <option value="">All Types</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="png">PNG Images</option>
                  <option value="jpg">JPEG Images</option>
                  <option value="word">Word Files</option>
                </select>
              </div>

              {/* Results Grid */}
              <div className="space-y-4">
                {files.length > 0 ? (
                  files.map(file => (
                    <div key={file.id} className="bg-slate-900/30 border border-slate-800 hover:border-slate-700/80 p-3.5 rounded-xl flex justify-between items-center transition-all">
                      <div>
                        <h4 className="font-bold text-slate-100">{file.fileName}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Type: {file.fileType || "unknown"} | Size: {(file.fileSize / 1024 / 1024).toFixed(2)} MB | Path: <span className="font-mono text-slate-400">{file.filePath}</span>
                        </p>
                        {file.description && (
                          <p className="text-sm text-slate-400 mt-2 italic bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-850/50 inline-block">
                            Description: {file.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold uppercase">
                            {file.category}
                          </span>
                          {file.subCategory && (
                            <span className="block text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                              {file.subCategory}
                            </span>
                          )}
                        </div>
                        <button className="bg-indigo-650 hover:bg-indigo-550 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-655/10 flex items-center space-x-1.5 cursor-pointer">
                          <i className="fa-solid fa-folder-open text-[10px]"></i>
                          <span>Open File</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">No matching indexed documents found.</div>
                )}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="max-w-2xl space-y-4 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Ingest New Document
                </h2>
                <p className="text-slate-400 mt-1">Files are copied into the local store and hashed automatically for integrity checking.</p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-5 bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl backdrop-blur-md">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select File</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all flex flex-col items-center justify-center cursor-pointer bg-slate-955/40 relative">
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-indigo-400 mb-2"></i>
                    <p className="text-sm font-semibold mt-2 text-slate-355">
                      {uploadFile ? uploadFile.name : "Drag & drop files or click to browse"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDFs, Images, Word, and Excel"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subcategory</label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      disabled={!selectedCatId}
                      className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200 disabled:opacity-40"
                    >
                      <option value="">Select Subcategory</option>
                      {availableSubCategories.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide keywords or brief summary for search index..."
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm h-24 focus:outline-none focus:border-indigo-500 resize-none text-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer text-white"
                >
                  <i className="fa-solid fa-file-shield text-xs"></i>
                  <span>Index and Store File</span>
                </button>

                {uploadStatus && (
                  <div className={`p-4 rounded-xl text-xs font-medium ${
                    uploadStatus.includes("successfully") ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                  }`}>
                    {uploadStatus}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Category Master Tab */}
          {activeTab === "categories" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Category & Subcategory Master
                  </h2>
                  <p className="text-slate-400 mt-1">Manage the classifications used to index files in the system database.</p>
                </div>
              </div>

              {/* Create Category Section */}
              <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl backdrop-blur-md max-w-xl">
                <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider mb-4">Create New Category</h3>
                <form onSubmit={handleCreateCategory} className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Engineering)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-200"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20"
                  >
                    Create
                  </button>
                </form>
              </div>

              {/* Categories List/Grid */}
              <div>
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4">Category Registry</h3>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <div key={cat.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col justify-between min-h-[260px] hover:border-slate-750 transition-all">
                        <div>
                          {/* Category Card Header */}
                          <div className="flex justify-between items-center pb-3 border-b border-slate-800/50 mb-4">
                            {editingCatId === cat.id ? (
                              <div className="flex gap-2 w-full">
                                <input
                                  type="text"
                                  value={editingCatName}
                                  onChange={(e) => setEditingCatName(e.target.value)}
                                  className="flex-1 bg-slate-955 border border-slate-850 rounded-lg px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                                  autoFocus
                                />
                                <button onClick={() => handleUpdateCategory(cat.id)} className="bg-emerald-600 hover:bg-emerald-500 p-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer">
                                  <i className="fa-solid fa-check text-[10px]"></i>
                                </button>
                                <button onClick={() => { setEditingCatId(null); setEditingCatName(""); }} className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer">
                                  <i className="fa-solid fa-xmark text-[10px]"></i>
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-bold text-slate-100 text-lg">{cat.name}</h4>
                                <div className="flex space-x-1.5">
                                  <button
                                    onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                                    className="text-slate-400 hover:text-slate-200 p-1 text-xs hover:bg-slate-800/40 rounded transition-colors cursor-pointer"
                                    title="Rename Category"
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-slate-400 hover:text-rose-450 p-1 text-xs hover:bg-slate-800/40 rounded transition-colors cursor-pointer"
                                    title="Delete Category"
                                  >
                                    <i className="fa-solid fa-trash-can text-rose-500 hover:text-rose-400"></i>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Subcategories list */}
                          <div className="space-y-2 mb-6">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Subcategories</span>
                            {cat.subCategories && cat.subCategories.length > 0 ? (
                              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                                {cat.subCategories.map((sub) => (
                                  <div key={sub.id} className="flex justify-between items-center bg-slate-955/30 border border-slate-850/40 px-3 py-2 rounded-xl group transition-all">
                                    {editingSubId === sub.id ? (
                                      <div className="flex gap-2 w-full">
                                        <input
                                          type="text"
                                          value={editingSubName}
                                          onChange={(e) => setEditingSubName(e.target.value)}
                                          className="flex-1 bg-slate-955 border border-slate-805 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                          autoFocus
                                        />
                                        <button onClick={() => handleUpdateSubCategory(sub.id)} className="bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded text-[10px] flex items-center justify-center cursor-pointer">
                                          <i className="fa-solid fa-check text-[9px] mr-1"></i> Save
                                        </button>
                                        <button onClick={() => { setEditingSubId(null); setEditingSubName(""); }} className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-[10px] flex items-center justify-center cursor-pointer">
                                          <i className="fa-solid fa-xmark text-[9px] mr-1"></i> Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-sm text-slate-350">{sub.name}</span>
                                        <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => { setEditingSubId(sub.id); setEditingSubName(sub.name); }}
                                            className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                                            title="Rename"
                                          >
                                            <i className="fa-solid fa-pen text-[9px]"></i>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSubCategory(sub.id)}
                                            className="text-[10px] text-slate-400 hover:text-rose-455 cursor-pointer"
                                            title="Delete"
                                          >
                                            <i className="fa-solid fa-trash text-[9px]"></i>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-550 italic py-1">No subcategories defined</div>
                            )}
                          </div>
                        </div>

                        {/* Quick Add Subcategory Form */}
                        <div className="mt-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="New subcategory..."
                              value={newSubName[cat.id] || ""}
                              onChange={(e) => setNewSubName({ ...newSubName, [cat.id]: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Enter") handleCreateSubCategory(cat.id); }}
                              className="flex-1 bg-slate-955 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-350"
                            />
                            <button
                              onClick={() => handleCreateSubCategory(cat.id)}
                              className="bg-slate-850 hover:bg-indigo-600 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 hover:border-indigo-600 transition-all flex items-center justify-center cursor-pointer"
                            >
                              <i className="fa-solid fa-plus text-[10px] mr-1.5"></i>
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                    <p>No categories found in the registry.</p>
                    <p className="text-xs text-slate-600 mt-1">Use the "Create New Category" form above to initialize classifications.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Backup Tab */}
          {activeTab === "backup" && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  System Backup & Sync
                </h2>
                <p className="text-slate-400 mt-1">Pack document directories and SQLite schema states into compressed directories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Control Panel & Terminal */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Backup Trigger Card */}
                  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl shadow-xl flex justify-between items-center backdrop-blur-md hover:border-indigo-500/30 transition-all">
                    <div>
                      <h3 className="font-bold text-slate-100 text-lg">Workstation Cold Backup</h3>
                      <p className="text-slate-400 text-sm mt-1">Copies all documents in `organized/` and records a DB sync point.</p>
                    </div>
                    <button
                      onClick={handleStartBackup}
                      disabled={isBackingUp}
                      className="py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-indigo-650 hover:from-emerald-500 hover:to-indigo-550 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 cursor-pointer"
                    >
                      {isBackingUp ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin mr-1"></i>
                          <span>Backing up...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up mr-1"></i>
                          <span>Start Full Backup</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Terminal Logging Card */}
                  <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <i className="fa-solid fa-terminal text-indigo-400"></i>
                        <span>WebSocket Progress Log</span>
                      </span>
                      <span className={`w-2 h-2 rounded-full ${isBackingUp ? "bg-emerald-500 animate-ping" : "bg-slate-650"}`} />
                    </div>
                    <div className="font-mono text-[11px] bg-slate-955 text-indigo-400 p-3 border border-slate-800 rounded-xl h-64 overflow-y-auto space-y-1.5 scrollbar-thin shadow-inner">
                      {backupLogs.map((log, index) => (
                        <div key={index} className={
                          log.startsWith("[Error]") ? "text-rose-400 font-bold" : 
                          log.startsWith("[Client]") ? "text-slate-500" :
                          log.startsWith("[Result]") ? "text-emerald-400 font-extrabold uppercase tracking-wide py-0.5" : "text-indigo-300"
                        }>
                          {log}
                        </div>
                      ))}
                      {backupLogs.length === 0 && (
                        <div className="text-slate-600 italic">Console terminal idle. Ready to start document pack.</div>
                      )}
                    </div>
                  </div>

                </div>

                {/* History Table Column */}
                <div className="bg-slate-900/30 border border-slate-800/80 p-4 rounded-xl">
                  <h3 className="font-bold text-sm text-slate-355 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                    <i className="fa-solid fa-clock-rotate-left text-indigo-400"></i>
                    <span>Backup Registry History</span>
                  </h3>
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {backupHistory.map(record => (
                      <div key={record.id} className="bg-slate-955/40 border border-slate-850 p-3 rounded-xl space-y-2 hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold tracking-wide uppercase">
                            {record.status}
                          </span>
                          <span className="text-[10px] text-slate-550 font-medium">
                            {record.timestamp ? new Date(record.timestamp).toLocaleString() : "-"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono break-all">{record.backupPath}</p>
                      </div>
                    ))}
                    {backupHistory.length === 0 && (
                      <div className="text-center py-8 text-slate-550 text-xs italic">No backup records registered.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* Preferences Modal */}
      {isPrefOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scaleUp text-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <h3 className="text-xl font-bold flex items-center space-x-2.5">
                <i className="fa-solid fa-sliders text-indigo-400"></i>
                <span>Workstation Preferences</span>
              </h3>
              <button 
                onClick={() => setIsPrefOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-5">
              {/* Startup Tab */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                  Default Landing Tab
                </label>
                <select
                  value={preferences.defaultTab}
                  onChange={(e) => setPreferences({ ...preferences, defaultTab: e.target.value })}
                  className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                >
                  <option value="dashboard">Workstation Monitor (Dashboard)</option>
                  <option value="explorer">Workstation Explorer (Directory Browser)</option>
                  <option value="search">Search Index</option>
                  <option value="upload">Ingest Document</option>
                  <option value="categories">Category Master</option>
                  <option value="backup">System Backup</option>
                </select>
              </div>

              {/* Deduplication Strategy */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                  Deduplication Check
                </label>
                <div className="flex items-center space-x-3 bg-slate-955 border border-slate-800 rounded-xl p-4">
                  <input
                    type="checkbox"
                    id="dedup"
                    checked={preferences.dedupStrategy === "sha256"}
                    onChange={(e) => setPreferences({ ...preferences, dedupStrategy: e.target.checked ? "sha256" : "none" })}
                    className="w-4 h-4 text-indigo-600 border-slate-800 rounded focus:ring-indigo-550 focus:ring-2 focus:ring-offset-slate-900 bg-slate-955"
                  />
                  <label htmlFor="dedup" className="text-sm text-slate-305 select-none cursor-pointer">
                    Enable SHA-256 Hashing & Deduplication
                  </label>
                </div>
              </div>

              {/* Paths Settings */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-455">
                  Physical Storage Paths
                </label>
                <div>
                  <span className="text-[10px] text-slate-550 font-bold block mb-1">ORGANIZED ROOT</span>
                  <input
                    type="text"
                    value={preferences.storageRoot}
                    onChange={(e) => setPreferences({ ...preferences, storageRoot: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-550 font-bold block mb-1">INGEST TMP FOLDER</span>
                  <input
                    type="text"
                    value={preferences.ingestTmp}
                    onChange={(e) => setPreferences({ ...preferences, ingestTmp: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
              </div>

              {/* Backup Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                    Auto-Backup
                  </label>
                  <div className="flex items-center space-x-2 h-[46px] px-3 bg-slate-955 border border-slate-800 rounded-xl">
                    <input
                      type="checkbox"
                      id="autoSync"
                      checked={preferences.autoBackup}
                      onChange={(e) => setPreferences({ ...preferences, autoBackup: e.target.checked })}
                      className="w-3.5 h-3.5 text-indigo-600 border-slate-800 rounded focus:ring-indigo-550"
                    />
                    <label htmlFor="autoSync" className="text-xs text-slate-300 select-none cursor-pointer">
                      Auto Backup
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-2">
                    Backup Interval
                  </label>
                  <select
                    value={preferences.backupInterval}
                    disabled={!preferences.autoBackup}
                    onChange={(e) => setPreferences({ ...preferences, backupInterval: e.target.value })}
                    className="w-full bg-slate-955 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 disabled:opacity-40"
                  >
                    <option value="1">Every Hour</option>
                    <option value="4">Every 4 Hours</option>
                    <option value="12">Every 12 Hours</option>
                    <option value="24">Every 24 Hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={() => setIsPrefOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("epatra_preferences", JSON.stringify(preferences));
                  setIsPrefOpen(false);
                  addLog("info", "Saved updated workstation preferences to localStorage.");
                }}
                className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-650/20 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-scaleUp text-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold flex items-center space-x-2.5">
                <i className="fa-solid fa-circle-question text-indigo-400"></i>
                <span>e-Patra Documentation & Help</span>
              </h3>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="overflow-y-auto pr-2 space-y-6 flex-1 text-sm text-slate-300">
              {/* Quick Start Guide */}
              <section className="space-y-2">
                <h4 className="font-bold text-indigo-400 text-base flex items-center space-x-2">
                  <i className="fa-solid fa-rocket text-indigo-455"></i>
                  <span>Quick Start Guide</span>
                </h4>
                <p className="text-xs text-slate-405">
                  e-Patra is a secure, local-first document management system. Follow these basic workflows to manage files:
                </p>
                <div className="bg-slate-955 border border-slate-800/60 p-4 rounded-xl space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded text-xs">1</span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      <strong>Define Categories</strong>: Go to the <strong>Category Master</strong> page to setup classification folder buckets (e.g. Legal, Finance).
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded text-xs">2</span>
                    <p className="text-xs text-slate-305 mt-0.5">
                      <strong>Ingest Document</strong>: Go to the <strong>Ingest Document</strong> tab, choose a file from your computer, assign a category, and submit.
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded text-xs">3</span>
                    <p className="text-xs text-slate-305 mt-0.5">
                      <strong>Inspect Organized Files</strong>: Go to the <strong>Workstation Explorer</strong> tab to browse files under the dynamically structured folders.
                    </p>
                  </div>
                </div>
              </section>

              {/* Physical Storage Layout */}
              <section className="space-y-2">
                <h4 className="font-bold text-indigo-400 text-base flex items-center space-x-2">
                  <i className="fa-solid fa-folder-tree text-indigo-455"></i>
                  <span>Storage Layout Strategy</span>
                </h4>
                <p className="text-xs text-slate-405">
                  Ingested documents are organized physical structures on your disk based on their format and indexing timestamp:
                </p>
                <div className="bg-slate-955 border border-slate-800/60 p-3 rounded-xl font-mono text-[10px] text-slate-300 leading-relaxed">
                  organized/<br />
                  &nbsp;├── pdf/<br />
                  &nbsp;│&nbsp;&nbsp; └── 2026/<br />
                  &nbsp;│&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; └── 06/<br />
                  &nbsp;│&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp; └── annual_report.pdf<br />
                  &nbsp;└── png/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp; └── 2026/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; └── 06/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; └── office_layout.png
                </div>
              </section>

              {/* Deduplication & Integrity */}
              <section className="space-y-2">
                <h4 className="font-bold text-indigo-400 text-base flex items-center space-x-2">
                  <i className="fa-solid fa-shield-halved text-indigo-455"></i>
                  <span>Deduplication & Hashing</span>
                </h4>
                <p className="text-xs text-slate-305 leading-relaxed">
                  Every ingested file undergoes SHA-256 integrity signature calculations. If a document matches an existing hash registry, e-Patra blocks duplicate storage to save disk space and notifies the dashboard metrics.
                </p>
              </section>

              {/* System Diagnostics & Troubleshooting */}
              <section className="space-y-2">
                <h4 className="font-bold text-indigo-400 text-base flex items-center space-x-2">
                  <i className="fa-solid fa-screwdriver-wrench text-indigo-455"></i>
                  <span>Troubleshooting Connections</span>
                </h4>
                <div className="bg-slate-955 border border-slate-800/60 p-3.5 rounded-xl space-y-2 text-xs">
                  <div>
                    <h5 className="font-bold text-rose-455">Issue: Connected (Disconnected / Mock Mode)</h5>
                    <p className="text-slate-450 mt-0.5 leading-relaxed">
                      This indicates the Java Spring Boot API is not listening at <code>http://localhost:8080</code>. The frontend falls back to mock operational mode automatically. Ensure you run <code>.\dev.bat</code> to start the backend.
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-amber-450">Issue: Hot Reload failure</h5>
                    <p className="text-slate-455 mt-0.5 leading-relaxed">
                      If Tauri fails to sync files, restart your development servers by running <code>.\clean.bat</code> followed by <code>.\dev.bat</code>.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-800 mt-6 flex-shrink-0">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-550 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-650/20 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Logs Modal */}
      {isLogsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-scaleUp text-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6 flex-shrink-0">
              <h3 className="text-xl font-bold flex items-center space-x-2.5">
                <i className="fa-solid fa-terminal text-indigo-400"></i>
                <span>Application Execution Logs</span>
              </h3>
              <button 
                onClick={() => setIsLogsOpen(false)}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Live Terminal Log Stream */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] bg-slate-955 border border-slate-800/80 rounded-2xl p-5 space-y-2.5 scrollbar-thin shadow-inner min-h-[300px]">
              {appLogs.map((log, index) => {
                let badgeClass = "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                if (log.type === "success") badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                if (log.type === "warning") badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                if (log.type === "error") badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";

                return (
                  <div key={index} className="flex items-start space-x-3 hover:bg-slate-900/40 p-1.5 rounded-lg transition-all border border-transparent hover:border-slate-850/50">
                    <span className="text-slate-500 select-none whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-5 border-t border-slate-800 mt-6 flex-shrink-0">
              <button
                onClick={() => {
                  setAppLogs([
                    { timestamp: new Date().toISOString(), type: "info", message: "Console logs cleared by workstation administrator." }
                  ]);
                }}
                className="bg-slate-800 hover:bg-slate-750 hover:text-rose-400 text-slate-450 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer border border-transparent hover:border-slate-700/50"
              >
                Clear Logs
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const text = appLogs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join("\n");
                    navigator.clipboard.writeText(text);
                    addLog("success", "Copied terminal logs to local clipboard.");
                    alert("Logs copied to clipboard!");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-2 border border-transparent hover:border-slate-700/50"
                >
                  <i className="fa-solid fa-copy"></i>
                  <span>Copy to Clipboard</span>
                </button>
                <button
                  onClick={() => setIsLogsOpen(false)}
                  className="bg-indigo-650 hover:bg-indigo-550 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-indigo-650/20 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
