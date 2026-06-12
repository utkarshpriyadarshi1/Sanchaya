-- Schema setup for e-Patra embedded SQLite database file_metadata.db

-- Table file_info: Stores uploaded document metadata index logs
CREATE TABLE IF NOT EXISTS file_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    description TEXT,
    category TEXT,
    sub_category TEXT,
    upload_date TIMESTAMP
);

-- Table file_metadata: Tracks layouts inside organized/ workspace
CREATE TABLE IF NOT EXISTS file_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_path TEXT,
    stored_path TEXT,
    file_type TEXT,
    year TEXT,
    month TEXT,
    file_size INTEGER,
    hash TEXT UNIQUE
);

-- Table category: Master classification labels
CREATE TABLE IF NOT EXISTS category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- Table sub_category: Secondary classification taxonomy linked to parent categories
CREATE TABLE IF NOT EXISTS sub_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

-- Table backup_records: Replicated archive logs
CREATE TABLE IF NOT EXISTS backup_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_path TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    status TEXT NOT NULL
);
