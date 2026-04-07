package com.jewellery.ProjWEB.admin.product.Specification;


import com.jewellery.ProjWEB.admin.product.model.request.ProductRequest;
import com.jewellery.ProjWEB.entity.ProductEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {
    public static Specification<ProductEntity> search(ProductRequest req){
        return (root, query, criterialBuilder) -> {
            List<Predicate> predicates =new ArrayList<>();
            if(req.getProductName() != null && !req.getProductName().equals("")){
                predicates.add(
                        criterialBuilder.like(criterialBuilder.lower(root.get("productName")),
                                '%'+req.getProductName()+'%')
                );
            }
            if(req.getPriceFrom() != 0){
                predicates.add(
                        criterialBuilder.greaterThanOrEqualTo(root.get("price"), req.getPriceFrom()
                ));
            }
            if(req.getPriceTo() != 0){
                predicates.add(
                        criterialBuilder.lessThanOrEqualTo(root.get("price"), req.getPriceTo())
                );
            }
            if(req.getStatus() != null){
                predicates.add(
                        criterialBuilder.like(criterialBuilder.lower(root.get("status")),'%'+req.getStatus()+'%')
                );
            }
            if(req.getCategoryName() != null){
                predicates.add(
                        criterialBuilder.like(criterialBuilder.lower(root.get("category").get("categoryName")),'%'+req.getCategoryName()+'%')
                );
            }
            return criterialBuilder.and(predicates.toArray(new Predicate[predicates.size()]));
        };
    }
}
