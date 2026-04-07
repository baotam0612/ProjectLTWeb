package com.jewellery.ProjWEB.admin.order.service;

import com.jewellery.ProjWEB.admin.order.model.dto.OrderDetailDTO;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetailDTO> findAll();
}
