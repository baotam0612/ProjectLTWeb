package com.jewellery.ProjWEB.admin.order.repository;

import com.jewellery.ProjWEB.entity.OrderDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDetailRepository extends JpaRepository<OrderDetailEntity, Integer> {
}
