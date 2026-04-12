package com.jewellery.ProjWEB.user.category.service.Impl;

import com.jewellery.ProjWEB.entity.CategoryEntity;
import com.jewellery.ProjWEB.user.category.model.CategoryDTO;
import com.jewellery.ProjWEB.user.category.repository.CategoryRepository;
import com.jewellery.ProjWEB.user.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service("userCategoryService")
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryServiceImpl(@Qualifier("userCategoryRepository") CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<CategoryDTO> findAllPublicCategories() {
        return categoryRepository.findByStatusIgnoreCase("ACTIVE").stream()
                .map(entity -> new CategoryDTO(entity.getId(), entity.getCategoryName()))
                .collect(Collectors.toList());
    }
}
