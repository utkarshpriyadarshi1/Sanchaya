package com.updevlogics.controller;

import com.updevlogics.model.Category;
import com.updevlogics.model.FileInfo;
import com.updevlogics.service.CategoryService;
import com.updevlogics.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Controller
public class FileController {
    @Autowired
    private FileService fileService;

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/upload")
    public String uploadPage(Model model) {
        List<Category> categories = categoryService.getAllCategories();
        model.addAttribute("categories", categories);
        return "upload";
    }

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file,
                             @RequestParam("description") String description,
                             @RequestParam("category") String category,
                             @RequestParam("subCategory") String subCategory,
                             Model model) {
        try {
            fileService.saveFile(file, description, category, subCategory);
            model.addAttribute("message", "File uploaded successfully!");
        } catch (IOException e) {
            model.addAttribute("message", "File upload failed: " + e.getMessage());
        }
        return "upload";
    }

    @GetMapping("/search")
    public String searchPage() {
        return "search";
    }

    @PostMapping("/search")
    public String searchFiles(@RequestParam("query") String query,
                              @RequestParam(value = "fileType", required = false) String fileType,
                              @RequestParam(value = "role", required = false) String role,
                              @RequestParam(value = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateFrom,
                              @RequestParam(value = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dateTo,
                              @RequestParam(value = "category", required = false) String category,
                              @RequestParam(value = "subCategory", required = false) String subCategory,
                              Model model) {
        List<FileInfo> files = fileService.searchFiles(query, fileType, role, dateFrom, dateTo, category, subCategory);
        model.addAttribute("files", files);
        return "search";
    }
}