package com.jewellery.ProjWEB.user.product.repository;

import com.jewellery.ProjWEB.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("userProductRepository")
public interface UserProductRepository extends JpaRepository<ProductEntity, Integer> {
    List<ProductEntity> findByCategoryId(Integer CategoryID);
    List<ProductEntity> findByStatusIgnoreCase(String status);
}
