package com.jewellery.ProjWEB.admin.product.repository;


import com.jewellery.ProjWEB.admin.product.model.dto.ProductDTO;
import com.jewellery.ProjWEB.admin.product.model.request.ProductRequest;
import com.jewellery.ProjWEB.entity.ProductEntity;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Integer>, JpaSpecificationExecutor<ProductEntity> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from ProductEntity p where p.id = :id")
    java.util.Optional<ProductEntity> findForUpdate(@org.springframework.data.repository.query.Param("id") Integer id);
}
