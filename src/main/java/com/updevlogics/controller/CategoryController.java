package com.updevlogics.controller;

import com.updevlogics.model.Category;
import com.updevlogics.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @PostMapping("/admin/createCategory")
    public String createCategory(@RequestParam("categoryName") String categoryName,
                                 @RequestParam("subCategoryName") String subCategoryName,
                                 Model model) {
        categoryService.createCategory(categoryName, subCategoryName);
        model.addAttribute("message", "Category and Subcategory created successfully!");
        return "createCategory";
    }

    @PostMapping("/admin/modifyCategory")
    public String modifyCategory(@RequestParam("categoryId") Long categoryId,
                                 @RequestParam("newCategoryName") String newCategoryName,
                                 @RequestParam("newSubCategoryName") String newSubCategoryName,
                                 Model model) {
        categoryService.modifyCategory(categoryId, newCategoryName, newSubCategoryName);
        model.addAttribute("message", "Category and Subcategory modified successfully!");
        return "modifyCategory";
    }
}