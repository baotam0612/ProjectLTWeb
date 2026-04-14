package com.jewellery.ProjWEB.user.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private Integer productId;
    private Integer quantity;
    private String shippingAddress;
    private String paymentMethod;
}
