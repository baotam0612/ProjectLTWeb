package com.jewellery.ProjWEB.admin.order.service;


import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import org.springframework.stereotype.Service;

import java.util.List;


public interface OrderService {
    List<OrderDTO>  findAll();
    OrderDTO updateOrderStatus(Integer orderId, String status);
    void deleteOrder(Integer orderId);
}
