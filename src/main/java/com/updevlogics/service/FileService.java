package com.updevlogics.service;

import com.updevlogics.model.FileInfo;
import com.updevlogics.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;

@Service
public class FileService {
    @Autowired
    private FileRepository fileRepository;

    public void saveFile(MultipartFile multipartFile, String description, String category, String subCategory) throws IOException {
        String fileName = multipartFile.getOriginalFilename();
        String filePath = "uploads/" + fileName;
        File file = new File(filePath);
        multipartFile.transferTo(file);

        FileInfo fileInfo = new FileInfo();
        fileInfo.setFileName(fileName);
        fileInfo.setFilePath(filePath);
        fileInfo.setFileType(multipartFile.getContentType());
        fileInfo.setFileSize(multipartFile.getSize());
        fileInfo.setDescription(description);
        fileInfo.setCategory(category);
        fileInfo.setSubCategory(subCategory);
        fileInfo.setUploadDate(new Date());

        fileRepository.saveFile(fileInfo);
    }

    public List<FileInfo> getAllFiles() {
        return fileRepository.getAllFiles();
    }

    public List<FileInfo> searchFiles(String query, String fileType, String role, Date dateFrom, Date dateTo, String category, String subCategory) {
        return fileRepository.searchFiles(query, fileType, role, dateFrom, dateTo, category, subCategory);
    }

    public List<FileInfo> getLast10Files() {
        return fileRepository.getLast10Files();
    }
}