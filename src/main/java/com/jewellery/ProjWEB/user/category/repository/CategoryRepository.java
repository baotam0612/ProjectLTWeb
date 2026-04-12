package com.jewellery.ProjWEB.user.category.repository;

import com.jewellery.ProjWEB.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("userCategoryRepository")
public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
    List<CategoryEntity> findByStatusIgnoreCase(String status);
}
