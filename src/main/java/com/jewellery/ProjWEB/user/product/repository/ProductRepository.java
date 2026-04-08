package com.jewellery.ProjWEB.user.product.repository;

import com.jewellery.ProjWEB.entity.ProductEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository("userProductRepository")
public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {
    List<ProductEntity> findByCategoryId(Integer CategoryID);

    @Query("select p from ProductEntity p where p.productName like %:name%")
    List<ProductEntity> findByProductNameContaining(@Param("name") String productName, Sort sort); // file entity như nào thì tên file này phải như thế
    List<ProductEntity> findAll(Sort sort);
//    List<ProductEntity> findAll(Sort sort);
}
