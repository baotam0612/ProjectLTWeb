package com.jewellery.ProjWEB.admin.category.service;


import com.jewellery.ProjWEB.admin.category.model.CategoryDTO;
import com.jewellery.ProjWEB.admin.category.model.CategoryRequest;
import com.jewellery.ProjWEB.admin.material.model.MaterialDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CategoryService {
    List<CategoryDTO> findAll();

    CategoryDTO addCategory(CategoryRequest categoryRequest);

    CategoryDTO updateCategory(Integer id, CategoryRequest categoryRequest);


}
