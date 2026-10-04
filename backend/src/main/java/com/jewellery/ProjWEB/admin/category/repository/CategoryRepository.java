package com.jewellery.ProjWEB.admin.category.repository;

import com.jewellery.ProjWEB.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer>, JpaSpecificationExecutor<CategoryEntity> {

    CategoryEntity findByCategoryName(String categoryName);
}
