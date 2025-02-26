package com.updevlogics.service;

import com.updevlogics.model.Category;
import com.updevlogics.model.SubCategory;
import com.updevlogics.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public void createCategory(String categoryName, String subCategoryName) {
        Category category = new Category();
        category.setName(categoryName);

        SubCategory subCategory = new SubCategory();
        subCategory.setName(subCategoryName);
        subCategory.setCategory(category);

        Set<SubCategory> subCategories = new HashSet<>();
        subCategories.add(subCategory);

        category.setSubCategories(subCategories);

        categoryRepository.save(category);
    }

    public void modifyCategory(Long categoryId, String newCategoryName, String newSubCategoryName) {
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(newCategoryName);

        Set<SubCategory> subCategories = category.getSubCategories();
        for (SubCategory subCategory : subCategories) {
            subCategory.setName(newSubCategoryName);
        }

        category.setSubCategories(subCategories);

        categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}