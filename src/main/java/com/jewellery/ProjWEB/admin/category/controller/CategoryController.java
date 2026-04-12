package com.jewellery.ProjWEB.admin.category.controller;


import com.jewellery.ProjWEB.admin.category.model.CategoryDTO;
import com.jewellery.ProjWEB.admin.category.model.CategoryRequest;
import com.jewellery.ProjWEB.admin.category.model.CategoryResponse;
import com.jewellery.ProjWEB.admin.category.service.CategoryService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("admin")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }


    @GetMapping("/categorys")
    public CategoryResponse categoryHomePage(){
        List<CategoryDTO> categoryDTOList = categoryService.findAll();
        return new CategoryResponse(HttpStatus.OK,"Query All Category successfully", categoryDTOList);
    }
    // thêm danh mục
    @PostMapping("/categorys")
    public CategoryResponse addCategory(@Valid @RequestBody CategoryRequest categoryRequest){
        CategoryDTO categoryDTO = categoryService.addCategory(categoryRequest);
        return new CategoryResponse(HttpStatus.CREATED,"Created category successful!", categoryDTO);
    }


    // sửa danh mục
    @PutMapping("/categorys/{id}")
    public CategoryResponse updateCategory( @PathVariable("id") Integer id,@Valid @RequestBody CategoryRequest categoryRequest){
        CategoryDTO categoryDTO = categoryService.updateCategory(id, categoryRequest);
        return new CategoryResponse(HttpStatus.OK,"Updated Category!", categoryDTO);
    }

    // update status
    @PutMapping("/categorys/{id}/status")
    public CategoryResponse updateCategoryStatus(@PathVariable("id") Integer id, @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO categoryDTO1 = categoryService.updateCategoryStatus(id, categoryDTO.getStatus());
        return new CategoryResponse(HttpStatus.OK,"Updated Category Status!", categoryDTO1);
    }

    // xoá danh mục
    @DeleteMapping("/categorys/{id}")
    public CategoryResponse deleteCategory(@PathVariable("id") Integer id) {
        try {
            categoryService.deleteCategory(id);
            return new CategoryResponse(HttpStatus.OK, "Category deleted successfully!", null);
        } catch (RuntimeException e) {
            return new CategoryResponse(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}
