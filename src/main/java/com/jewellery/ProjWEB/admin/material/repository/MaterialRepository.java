package com.jewellery.ProjWEB.admin.material.repository;


import com.jewellery.ProjWEB.entity.MaterialEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<MaterialEntity, Integer> {

    // JPQL
    @Query("SELECT m FROM MaterialEntity m  WHERE m.materialName LIKE %?1% ")
    List<MaterialEntity> findListByMaterialName(String materialName);

    MaterialEntity findByMaterialName(String materialName);

    MaterialEntity findByMaterialNameEqualsIgnoreCase(String materialName, Sort sort);

    MaterialEntity findByMaterialNameEqualsIgnoreCase(String materialName);
}
