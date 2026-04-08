package com.jewellery.ProjWEB.admin.category.service.Impl;

import com.jewellery.ProjWEB.admin.category.model.CategoryDTO;
import com.jewellery.ProjWEB.admin.category.model.CategoryRequest;
import com.jewellery.ProjWEB.admin.category.repository.CategoryRepository;
import com.jewellery.ProjWEB.admin.category.service.CategoryService;
import com.jewellery.ProjWEB.entity.CategoryEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.ui.ModelMap;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    public CategoryServiceImpl(CategoryRepository categoryRepository, ModelMapper modelMapper){
        this.categoryRepository = categoryRepository;
        this.modelMapper = modelMapper;
    }


    @Override
    public CategoryDTO addCategory(CategoryRequest categoryRequest) {
        CategoryEntity categoryEntity = categoryRepository.findByCategoryName(categoryRequest.getCategoryName());
        if(categoryEntity != null) throw new RuntimeException("CategoryName exists!");
        else{
            CategoryEntity result = modelMapper.map(categoryRequest, CategoryEntity.class);
            categoryRepository.save(result);
            return modelMapper.map(result, CategoryDTO.class);
        }
    }

    @Override
    public List<CategoryDTO> findAll() {
        List<CategoryEntity> categoryEntityList = categoryRepository.findAll();
        List<CategoryDTO> categoryDTOList = new ArrayList<>();
        for(CategoryEntity item : categoryEntityList){
            categoryDTOList.add(modelMapper.map(item, CategoryDTO.class));
        }
        return categoryDTOList;
    }

    @Override
    public CategoryDTO updateCategory(Integer id, CategoryRequest categoryRequest) {
        CategoryEntity categoryEntity = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category Not Found"));
        categoryEntity.setCategoryName(categoryRequest.getCategoryName());
        categoryEntity.setDescription(categoryRequest.getDescription());
        categoryEntity.setStatus(categoryRequest.getStatus());
        categoryRepository.save(categoryEntity);
        return modelMapper.map(categoryEntity, CategoryDTO.class);
    }
}
