package com.jewellery.ProjWEB.admin.category.service;


import com.jewellery.ProjWEB.admin.category.model.CategoryDTO;
import com.jewellery.ProjWEB.admin.category.model.CategoryRequest;
import org.springframework.stereotype.Service;

@Service
public interface CategoryService {
    CategoryDTO addCategory(CategoryRequest categoryRequest);

    CategoryDTO updateCategory(Integer id, CategoryRequest categoryRequest);
}
