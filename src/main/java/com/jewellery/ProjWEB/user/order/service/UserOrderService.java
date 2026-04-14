package com.jewellery.ProjWEB.user.order.service;

import com.jewellery.ProjWEB.user.order.model.dto.OrderRequest;

public interface UserOrderService {
    String placeOrder(OrderRequest request, String username);
}
