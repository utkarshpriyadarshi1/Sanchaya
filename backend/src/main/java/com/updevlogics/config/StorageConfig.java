package com.updevlogics.config;

import org.springframework.context.annotation.Configuration;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StorageConfig {
    
    private static final String APP_DIR_NAME = ".e-patra";
    
    public static String getAppHomePath() {
        return System.getProperty("user.home") + File.separator + APP_DIR_NAME;
    }
    
    public static Path getUploadsDir() {
        return Paths.get(getAppHomePath(), "uploads").toAbsolutePath();
    }
    
    public static Path getOrganizedDir() {
        return Paths.get(getAppHomePath(), "organized").toAbsolutePath();
    }
    
    public static Path getBackupsDir() {
        return Paths.get(getAppHomePath(), "backups").toAbsolutePath();
    }
}
