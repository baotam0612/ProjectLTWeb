package com.jewellery.ProjWEB.admin.pagination;

import com.jewellery.ProjWEB.admin.category.model.CategoryDTO;
import com.jewellery.ProjWEB.admin.category.repository.CategoryRepository;
import com.jewellery.ProjWEB.admin.material.model.MaterialDTO;
import com.jewellery.ProjWEB.admin.material.repository.MaterialRepository;
import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import com.jewellery.ProjWEB.admin.order.repository.OrderRepository;
import com.jewellery.ProjWEB.admin.order.service.OrderService;
import com.jewellery.ProjWEB.admin.payment.model.PaymentDTO;
import com.jewellery.ProjWEB.admin.payment.repository.PaymentRepository;
import com.jewellery.ProjWEB.admin.product.model.dto.ProductDTO;
import com.jewellery.ProjWEB.admin.product.repository.ProductRepository;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.repository.UserRepository;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminListService {
    private final UserRepository users;
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final MaterialRepository materials;
    private final OrderRepository orders;
    private final PaymentRepository payments;
    private final OrderService orderService;
    private final ModelMapper mapper;

    public PageResponse<Map<String, Object>> users(PageQuery query) {
        return PageResponse.from(users.findAll(text(query.getQ(), "username", "fullName", "email", "phoneNumber", "address"),
                query.pageable("id")).map(AdminListService::userMap));
    }

    public PageResponse<ProductDTO> products(PageQuery query) {
        Specification<com.jewellery.ProjWEB.entity.ProductEntity> spec = text(query.getQ(), "productName");
        if (hasFilter(query.getCategory())) {
            spec = spec.and((root, cq, cb) -> cb.equal(cb.lower(root.get("category").get("categoryName")),
                    query.getCategory().toLowerCase(Locale.ROOT)));
        }
        return PageResponse.from(products.findAll(spec, query.pageable("id")).map(entity -> {
            ProductDTO dto = mapper.map(entity, ProductDTO.class);
            dto.setCategoryName(entity.getCategory().getCategoryName());
            return dto;
        }));
    }

    public PageResponse<CategoryDTO> categories(PageQuery query) {
        return PageResponse.from(categories.findAll(text(query.getQ(), "categoryName", "description"),
                query.pageable("id")).map(entity -> mapper.map(entity, CategoryDTO.class)));
    }

    public PageResponse<MaterialDTO> materials(PageQuery query) {
        return PageResponse.from(materials.findAll(text(query.getQ(), "materialName"),
                query.pageable("materialID")).map(entity -> mapper.map(entity, MaterialDTO.class)));
    }

    public PageResponse<OrderDTO> orders(PageQuery query) {
        Specification<com.jewellery.ProjWEB.entity.OrderEntity> spec = (root, cq, cb) -> {
            if (!hasFilter(query.getStatus())) return cb.conjunction();
            var status = cb.lower(root.<String>get("orderStatus"));
            String filter = query.getStatus().toLowerCase(Locale.ROOT);
            if (filter.equals("pending")) {
                return cb.or(cb.isNull(status), cb.not(status.in("completed", "canceled", "cancelled")));
            }
            if (filter.equals("canceled")) return status.in("canceled", "cancelled");
            return cb.equal(status, filter);
        };
        return PageResponse.from(orders.findAll(spec, query.pageable("orderID")).map(orderService::toDTO));
    }

    public PageResponse<PaymentDTO> payments(PageQuery query) {
        Specification<com.jewellery.ProjWEB.entity.PaymentEntity> spec = (root, cq, cb) ->
                !hasFilter(query.getStatus()) ? cb.conjunction() :
                cb.equal(cb.lower(root.get("paymentStatus")), query.getStatus().toLowerCase(Locale.ROOT));
        java.math.BigDecimal amount = payments.totalAmount();
        return PageResponse.from(payments.findAll(spec, query.pageable("paymentID")).map(entity -> {
            PaymentDTO dto = mapper.map(entity, PaymentDTO.class);
            if (entity.getOrder() != null) dto.setOrderID(entity.getOrder().getOrderID());
            return dto;
        })).withSummary(Map.of("totalPayments", payments.count(),
                "successfulPayments", payments.countByPaymentStatusIgnoreCase("Success"),
                "totalAmount", amount == null ? java.math.BigDecimal.ZERO : amount));
    }

    private static boolean hasFilter(String value) {
        return value != null && !value.isBlank() && !value.equalsIgnoreCase("all");
    }

    private static <T> Specification<T> text(String search, String... fields) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String term = search.trim().toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
            Predicate[] matches = new Predicate[fields.length];
            for (int i = 0; i < fields.length; i++) {
                Path<String> path = root.get(fields[i]);
                matches[i] = cb.like(cb.lower(path), "%" + term + "%", '\\');
            }
            return cb.or(matches);
        };
    }

    public static Map<String, Object> userMap(User user) {
        return Map.of("id", user.getId(), "username", user.getUsername(), "email", user.getEmail(),
                "fullName", user.getFullName() == null ? "" : user.getFullName(),
                "address", user.getAddress() == null ? "" : user.getAddress(),
                "phoneNumber", user.getPhoneNumber() == null ? "" : user.getPhoneNumber(),
                "enabled", user.isEnabled(), "createdAt", user.getCreatedAt() == null ? "" : user.getCreatedAt().toString(),
                "roles", user.getRoles().stream().map(role -> role.getName().name()).toList());
    }
}
