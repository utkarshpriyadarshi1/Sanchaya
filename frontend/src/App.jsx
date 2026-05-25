import React, { useState, useEffect } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
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
    fetchCategories();
    fetchFiles();
    fetchBackupHistory();
    fetchStorageStats();
    fetchFileMetadata();
  };

  // Test backend connectivity and fetch initial data
  useEffect(() => {
    fetch("http://localhost:8080/api/files/all", { method: "HEAD" })
      .then(() => {
        setBackendConnected(true);
        syncAllData();
      })
      .catch(() => {
        setBackendConnected(false);
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
          organizedPath: "C:\\Users\\utkar\\Desktop\\Projects\\e-dashtavej\\e-dastavej\\organized",
          uploadsPath: "C:\\Users\\utkar\\Desktop\\Projects\\e-dashtavej\\e-dastavej\\uploads"
        });
        setFileMetadata([
          { id: 1, originalPath: "C:\\Downloads\\report.pdf", storedPath: "organized/pdf/2026/05/annual_report_2026.pdf", fileType: "pdf", year: "2026", month: "05", fileSize: 1048576, hash: "a3f5b9021876cd49b387ea1023a7" },
          { id: 2, originalPath: "C:\\Pictures\\layout.png", storedPath: "organized/png/2026/05/office_layout.png", fileType: "png", year: "2026", month: "05", fileSize: 2048576, hash: "f928e10398ab76d203cfeb9272d1" }
        ]);
      });
  }, []);



  // WebSocket Backup progress handler
  const handleStartBackup = () => {
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
        })
        .catch(err => {
          setBackupLogs(prev => [...prev, `[Error] Service request failed: ${err.message}`]);
          setIsBackingUp(false);
        });
    };

    ws.onmessage = (event) => {
      setBackupLogs(prev => [...prev, `[Server] ${event.data}`]);
    };

    ws.onerror = () => {
      setBackupLogs(prev => [...prev, "[Error] WebSocket communication failure."]);
    };

    ws.onclose = () => {
      setBackupLogs(prev => [...prev, "[Client] WebSocket socket pipeline closed."]);
      setIsBackingUp(false);
      fetchBackupHistory();
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
        setNewCatName("");
        fetchCategories();
      })
      .catch(err => console.error("Error creating category:", err));
  };

  const handleUpdateCategory = (id) => {
    if (!editingCatName.trim()) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => c.id === id ? { ...c, name: editingCatName.trim() } : c));
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
        setEditingCatId(null);
        setEditingCatName("");
        fetchCategories();
      })
      .catch(err => console.error("Error updating category:", err));
  };

  const handleDeleteCategory = (id) => {
    if (!confirm("Are you sure you want to delete this category? All its subcategories will also be deleted.")) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.filter(c => c.id !== id));
      return;
    }

    fetch(`http://localhost:8080/api/categories/${id}`, {
      method: "DELETE"
    })
      .then(() => fetchCategories())
      .catch(err => console.error("Error deleting category:", err));
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
        setNewSubName({ ...newSubName, [catId]: "" });
        fetchCategories();
      })
      .catch(err => console.error("Error creating subcategory:", err));
  };

  const handleUpdateSubCategory = (subId) => {
    if (!editingSubName.trim()) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => ({
        ...c,
        subCategories: c.subCategories.map(s => s.id === subId ? { ...s, name: editingSubName.trim() } : s)
      })));
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
        setEditingSubId(null);
        setEditingSubName("");
        fetchCategories();
      })
      .catch(err => console.error("Error updating subcategory:", err));
  };

  const handleDeleteSubCategory = (subId) => {
    if (!confirm("Are you sure you want to delete this subcategory?")) return;

    if (!backendConnected) {
      // Mock mode
      setCategories(categories.map(c => ({
        ...c,
        subCategories: c.subCategories.filter(s => s.id !== subId)
      })));
      return;
    }

    fetch(`http://localhost:8080/api/categories/subcategories/${subId}`, {
      method: "DELETE"
    })
      .then(() => fetchCategories())
      .catch(err => console.error("Error deleting subcategory:", err));
  };

  // File Upload Handler
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadStatus("Please select a file first.");
      return;
    }
    if (!category) {
      setUploadStatus("Please select a category.");
      return;
    }

    setUploadStatus("Uploading to local Spring Boot SQLite service...");

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
      .then(res => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(() => {
        setUploadStatus("File successfully stored and indexed!");
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
        {/* Native OS window decoration dots */}
        <div className="flex space-x-1.5 items-center">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition-colors" title="Close Workspace" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition-colors" title="Minimize Window" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition-colors" title="Zoom View" />
        </div>

        {/* Client Window Title */}
        <div className="text-xs font-semibold text-slate-400 tracking-wider flex items-center space-x-2">
          <span>📁</span>
          <span>e-Dastavej Desktop Workstation Client</span>
        </div>

        {/* Host loopback context tag */}
        <div className="text-[10px] bg-slate-950 border border-slate-800/60 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold tracking-wide uppercase">
          Local Workstation
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-66 bg-slate-900/90 border-r border-slate-800 p-6 flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
                e
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">e-Dastavej</h1>
                <span className="text-xs text-slate-500 font-medium tracking-wide">LOCAL REPOSITORY</span>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base">📊</span>
                <span className="text-sm">Workstation Monitor</span>
              </button>
              <button
                onClick={() => setActiveTab("explorer")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "explorer"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base">📂</span>
                <span className="text-sm">Workstation Explorer</span>
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "search"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base">🔍</span>
                <span className="text-sm">Search Index</span>
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "upload"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base">📥</span>
                <span className="text-sm">Ingest Document</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "categories"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base">📁</span>
                <span className="text-sm">Category Master</span>
              </button>

              <button
                onClick={() => setActiveTab("backup")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "backup"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <span className="text-base">💾</span>
                <span className="text-sm">System Backup</span>
              </button>
            </nav>
          </div>

          {/* Connection Status Indicator */}
          <div className="bg-slate-850/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center space-x-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${backendConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <div className="text-xs">
                <div className="flex items-center space-x-1.5">
                  <p className="font-semibold text-slate-300">Local Backend</p>
                  {backendConnected && (
                    <button onClick={syncAllData} className="text-[10px] text-indigo-400 hover:text-indigo-300" title="Force Sync Workspace">
                      🔄
                    </button>
                  )}
                </div>
                <p className="text-slate-500 text-[10px]">{backendConnected ? "Connected (Port 8080)" : "Disconnected (Mock Mode)"}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-10 overflow-y-auto bg-slate-950/60 backdrop-blur-lg">
          
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Workstation Monitor
                </h2>
                <p className="text-slate-400 mt-1">Real-time telemetry of your local document database and physical storage partitions.</p>
              </div>

              {/* Workstation Storage Sizing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Physical Hard Drive Size Card */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Physical Workstation Storage</span>
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
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Workspace Directory Sizing</span>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Organized Repos</span>
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
                <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Engine Diagnostics</span>
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
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Recent Workstation Document Changes</h3>
                {files.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-350">
                      <thead className="bg-slate-900/70 text-slate-400 text-xs font-bold uppercase">
                        <tr>
                          <th className="p-4 rounded-l-xl">File Name</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Size</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Subcategory</th>
                          <th className="p-4 rounded-r-xl">Upload Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.slice(0, 8).map((file) => (
                          <tr key={file.id} className="border-b border-slate-800/30 hover:bg-slate-900/40 transition-colors">
                            <td className="p-4 font-semibold text-slate-200">{file.fileName}</td>
                            <td className="p-4 font-mono text-xs text-slate-400">{file.fileType || "Unknown"}</td>
                            <td className="p-4">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium">
                                {file.category}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">{file.subCategory || "General"}</td>
                            <td className="p-4 text-slate-500">
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
            <div className="space-y-6 animate-fadeIn h-full flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Workstation Explorer
                </h2>
                <p className="text-slate-400 mt-1">Browse the physically organized folder structure of the repository on your disk.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 flex-1 items-start">
                {/* Folder Directory Tree Panel */}
                <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 min-h-[480px] shadow-xl overflow-y-auto">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-850 mb-4 flex items-center space-x-1.5">
                    <span>📁</span> <span>organized /</span>
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
                              <span>{isTypeExpanded ? "📂" : "📁"}</span>
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
                                        <span>{isYearExpanded ? "📂" : "📁"}</span>
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
                                                  <span>{isMonthExpanded ? "📂" : "📁"}</span>
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
                                                        <span>📄</span>
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
                <div className="md:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 min-h-[480px] shadow-xl flex flex-col justify-between">
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
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Stored Path (Relative)</span>
                          <span className="font-mono text-indigo-400 break-all">{selectedFileMeta.storedPath}</span>
                        </div>
                        <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Original Path</span>
                          <span className="font-mono text-slate-400 break-all">{selectedFileMeta.originalPath}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold mb-0.5">File Sizing</span>
                            <span className="font-semibold text-slate-200">{(selectedFileMeta.fileSize / 1024 / 1024).toFixed(3)} MB</span>
                          </div>
                          <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold mb-0.5">Format Extension</span>
                            <span className="font-semibold uppercase text-slate-200">{selectedFileMeta.fileType}</span>
                          </div>
                        </div>
                        <div className="bg-slate-955/40 p-3 rounded-xl border border-slate-900">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Deduplication Signature (SHA-256)</span>
                          <span className="font-mono text-slate-400 break-all">{selectedFileMeta.hash}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-850 flex justify-end space-x-3">
                        <button 
                          onClick={() => handleOpenLocation(selectedFileMeta.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          Open Location
                        </button>
                        <button 
                          onClick={() => handleRunFile(selectedFileMeta.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-650/10"
                        >
                          Run Local File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-550 flex-1 space-y-2">
                      <span className="text-3xl">📁</span>
                      <p className="text-xs italic">Select an organized node from the directory tree to inspect workstation resource mappings.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Search Document Index
                </h2>
                <p className="text-slate-400 mt-1">Queries the local SQLite database for matching metadata and index text.</p>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
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
                    <div key={file.id} className="bg-slate-900/30 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl flex justify-between items-center transition-all">
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
                        <button className="bg-indigo-650 hover:bg-indigo-550 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/10">
                          Open File
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
            <div className="max-w-2xl space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Ingest New Document
                </h2>
                <p className="text-slate-400 mt-1">Files are copied into the local store and hashed automatically for integrity checking.</p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-5 bg-slate-900/30 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select File</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 relative">
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="text-3xl">📁</span>
                    <p className="text-sm font-semibold mt-2 text-slate-350">
                      {uploadFile ? uploadFile.name : "Drag & drop files or click to browse"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {uploadFile ? `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDFs, Images, Word, and Excel"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20"
                >
                  Index and Store File
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
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Category & Subcategory Master
                  </h2>
                  <p className="text-slate-400 mt-1">Manage the classifications used to index files in the system database.</p>
                </div>
              </div>

              {/* Create Category Section */}
              <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md max-w-xl">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                      <div key={cat.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[260px] hover:border-slate-750 transition-all">
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
                                <button onClick={() => handleUpdateCategory(cat.id)} className="bg-emerald-600 hover:bg-emerald-500 p-1.5 rounded-lg text-xs">
                                  Check
                                </button>
                                <button onClick={() => { setEditingCatId(null); setEditingCatName(""); }} className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-xs">
                                  ✖
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-bold text-slate-100 text-lg">{cat.name}</h4>
                                <div className="flex space-x-1.5">
                                  <button
                                    onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                                    className="text-slate-400 hover:text-slate-200 p-1 text-xs hover:bg-slate-800/40 rounded transition-colors"
                                    title="Rename Category"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-slate-400 hover:text-rose-450 p-1 text-xs hover:bg-slate-800/40 rounded transition-colors"
                                    title="Delete Category"
                                  >
                                    🗑️
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
                                        <button onClick={() => handleUpdateSubCategory(sub.id)} className="bg-emerald-600 hover:bg-emerald-500 px-2 py-0.5 rounded text-[10px]">
                                          Save
                                        </button>
                                        <button onClick={() => { setEditingSubId(null); setEditingSubName(""); }} className="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-[10px]">
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-sm text-slate-350">{sub.name}</span>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => { setEditingSubId(sub.id); setEditingSubName(sub.name); }}
                                            className="text-[10px] text-slate-400 hover:text-slate-200"
                                            title="Rename"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            onClick={() => handleDeleteSubCategory(sub.id)}
                                            className="text-[10px] text-slate-400 hover:text-rose-450"
                                            title="Delete"
                                          >
                                            🗑️
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
                              className="bg-slate-850 hover:bg-indigo-600 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-slate-800 hover:border-indigo-600 transition-all"
                            >
                              + Add
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
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  System Backup & Sync
                </h2>
                <p className="text-slate-400 mt-1">Pack document directories and SQLite schema states into compressed directories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Control Panel & Terminal */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Backup Trigger Card */}
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl flex justify-between items-center backdrop-blur-md">
                    <div>
                      <h3 className="font-bold text-slate-100 text-lg">Workstation Cold Backup</h3>
                      <p className="text-slate-400 text-sm mt-1">Copies all documents in `organized/` and records a DB sync point.</p>
                    </div>
                    <button
                      onClick={handleStartBackup}
                      disabled={isBackingUp}
                      className="py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-indigo-650 hover:from-emerald-500 hover:to-indigo-550 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-lg uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isBackingUp ? "Backing up..." : "Start Full Backup"}
                    </button>
                  </div>

                  {/* Terminal Logging Card */}
                  <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">WebSocket Progress Log</span>
                      <span className={`w-2 h-2 rounded-full ${isBackingUp ? "bg-emerald-500 animate-ping" : "bg-slate-650"}`} />
                    </div>
                    <div className="font-mono text-[11px] bg-slate-955 text-indigo-400 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto space-y-1.5 scrollbar-thin shadow-inner">
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
                <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl">
                  <h3 className="font-bold text-sm text-slate-355 uppercase tracking-wider mb-4">Backup Registry History</h3>
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {backupHistory.map(record => (
                      <div key={record.id} className="bg-slate-955/40 border border-slate-850 p-4 rounded-xl space-y-2 hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold tracking-wide uppercase">
                            {record.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
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
    </div>
  );
}

export default App;
