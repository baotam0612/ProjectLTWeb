package com.jewellery.ProjWEB.user.category.controller;

import com.jewellery.ProjWEB.user.category.model.CategoryDTO;
import com.jewellery.ProjWEB.user.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("userCategoryController")
@RequestMapping("/api/public")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(@Qualifier("userCategoryService") CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getPublicCategories() {
        List<CategoryDTO> result = categoryService.findAllPublicCategories();
        return ResponseEntity.ok(result);
    }
}
