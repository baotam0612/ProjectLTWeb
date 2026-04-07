package com.jewellery.ProjWEB.admin.order.service;


import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import org.springframework.stereotype.Service;

import java.util.List;


public interface OrderService {
    List<OrderDTO>  findAll();
 }
