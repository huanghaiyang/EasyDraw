package com.easydraw.controller;

import com.easydraw.dto.CategoryDto;
import com.easydraw.service.CategoryService;
import com.easydraw.utils.ResponseUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public Map<String, Object> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllActiveCategories();
        return ResponseUtils.buildSuccessResponse(categories);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getCategory(@PathVariable String id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseUtils.buildSuccessResponse(category);
    }

    @PostMapping
    public Map<String, Object> createCategory(@RequestBody CategoryRequest request) {
        CategoryDto category = categoryService.createCategory(
                request.getName(),
                request.getDescription(),
                request.getIcon(),
                request.getSortOrder()
        );
        return ResponseUtils.buildSuccessResponse(category);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateCategory(@PathVariable String id, @RequestBody CategoryRequest request) {
        CategoryDto category = categoryService.updateCategory(
                id,
                request.getName(),
                request.getDescription(),
                request.getIcon(),
                request.getSortOrder(),
                request.getIsActive()
        );
        return ResponseUtils.buildSuccessResponse(category);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseUtils.buildSuccessResponse(null);
    }

    // 内部类，用于接收请求参数
    public static class CategoryRequest {
        private String name;
        private String description;
        private String icon;
        private Integer sortOrder;
        private boolean isActive;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        public Integer getSortOrder() {
            return sortOrder;
        }

        public void setSortOrder(Integer sortOrder) {
            this.sortOrder = sortOrder;
        }

        public boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(boolean isActive) {
            this.isActive = isActive;
        }
    }

}
