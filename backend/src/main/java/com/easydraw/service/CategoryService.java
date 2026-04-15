package com.easydraw.service;

import com.easydraw.dto.CategoryDto;
import com.easydraw.entity.Category;
import com.easydraw.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getAllActiveCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(String categoryId) {
        Category category = categoryRepository.findById(UUID.fromString(categoryId))
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToDto(category);
    }

    public CategoryDto createCategory(String name, String description, String icon, Integer sortOrder) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setSortOrder(sortOrder);
        category.setActive(true);
        Category savedCategory = categoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    public CategoryDto updateCategory(String categoryId, String name, String description, String icon, Integer sortOrder, boolean isActive) {
        Category category = categoryRepository.findById(UUID.fromString(categoryId))
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setSortOrder(sortOrder);
        category.setActive(isActive);
        Category updatedCategory = categoryRepository.save(category);
        return convertToDto(updatedCategory);
    }

    public void deleteCategory(String categoryId) {
        Category category = categoryRepository.findById(UUID.fromString(categoryId))
                .orElseThrow(() -> new RuntimeException("Category not found"));
        categoryRepository.delete(category);
    }

    private CategoryDto convertToDto(Category category) {
        return new CategoryDto(
                category.getId().toString(),
                category.getName(),
                category.getDescription(),
                category.getIcon(),
                category.getSortOrder(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

}
