package com.jewellery.ProjWEB.admin.order.repository;

import com.jewellery.ProjWEB.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, Integer>, JpaSpecificationExecutor<OrderEntity> {

    @Query("SELECT DISTINCT o FROM OrderEntity o " +
            "INNER JOIN o.orderDetails od " +
            "WHERE od.product.id = :productId")
    List<OrderEntity> findOrdersByProductId(@Param("productId") Integer productId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from OrderEntity o where o.orderID = :id")
    java.util.Optional<OrderEntity> findForUpdate(@Param("id") Integer id);
}
