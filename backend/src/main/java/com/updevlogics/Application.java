package com.updevlogics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    static {
        String homeDir = System.getProperty("user.home");
        java.io.File appFolder = new java.io.File(homeDir, ".e-patra");
        if (!appFolder.exists()) {
            appFolder.mkdirs();
        }
    }

    public static void main(String[] args) {
        String homeDir = System.getProperty("user.home");
        java.io.File appFolder = new java.io.File(homeDir, ".e-patra");
        
        // Migrate existing database to user home if it exists locally
        java.io.File localDb = new java.io.File("file_metadata.db");
        java.io.File migratedDb = new java.io.File(appFolder, "file_metadata.db");
        if (localDb.exists() && !migratedDb.exists()) {
            try {
                java.nio.file.Files.copy(localDb.toPath(), migratedDb.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                System.out.println(">>> Migrated existing local SQLite database to: " + migratedDb.getAbsolutePath());
            } catch (Exception e) {
                System.err.println(">>> Database migration failed: " + e.getMessage());
            }
        }

        SpringApplication.run(Application.class, args);
    }
}
