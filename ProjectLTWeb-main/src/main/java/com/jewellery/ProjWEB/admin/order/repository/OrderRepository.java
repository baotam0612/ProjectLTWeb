package com.jewellery.ProjWEB.admin.order.repository;

import com.jewellery.ProjWEB.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity,Integer> {

}
