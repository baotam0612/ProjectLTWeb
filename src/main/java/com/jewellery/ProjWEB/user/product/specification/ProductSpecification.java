package com.jewellery.ProjWEB.user.product.specification;

import com.jewellery.ProjWEB.entity.CategoryEntity;
import com.jewellery.ProjWEB.entity.ProductDetailEntity;
import com.jewellery.ProjWEB.entity.ProductEntity;
import com.jewellery.ProjWEB.user.product.model.ProductSearchRequest;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
//import java.util.function.Predicate;

public class ProductSpecification {
    public static Specification<ProductEntity> getProduct(ProductSearchRequest request){
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            // tìm kiếm theo tên hoặc mô tả
            if (request.getName() != null && !request.getName().isBlank()) {
                String where = "%" + request.getName().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("productName")), where),
                        cb.like(cb.lower(root.get("description")), where)
                ));
            }

            // tìm kiếm theo danh mục
            if (request.getCategoryId() != null) {
                // Join từ Product sang Category và so sánh ID
                Join<ProductEntity, CategoryEntity> categoryJoin = root.join("category");
                predicates.add(cb.equal(categoryJoin.get("id"), request.getCategoryId()));
            }

            // lọc theo giá và danh mục
            if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
                // join bảng product với category
                Join<ProductEntity, CategoryEntity> categoryJoin = root.join("category");
                predicates.add(cb.equal(categoryJoin.get("categoryName"), request.getCategoryName()));
            }
            // lọc theo giá
            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }
            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));
            }

            // lọc theo composition
            if (request.getComposition() != null && !request.getComposition().isBlank()) {
                // join bảng product với productdetail
                Join<ProductEntity, ProductDetailEntity> productDTJoin = root.join("productDetails");
                predicates.add(cb.equal(productDTJoin.get("composition"), request.getComposition()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
