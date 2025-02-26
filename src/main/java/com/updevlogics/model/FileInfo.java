package com.updevlogics.model;

import javax.persistence.*;
import java.util.Date;

@Entity
public class FileInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private long fileSize;
    private String description;
    private String category;
    private String subCategory;
    private Date uploadDate;

    // Getters and Setters
}