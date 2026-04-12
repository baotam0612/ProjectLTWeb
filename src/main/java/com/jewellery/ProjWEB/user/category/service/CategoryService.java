package com.jewellery.ProjWEB.user.category.service;

import com.jewellery.ProjWEB.user.category.model.CategoryDTO;
import java.util.List;

public interface CategoryService {
    List<CategoryDTO> findAllPublicCategories();
}
