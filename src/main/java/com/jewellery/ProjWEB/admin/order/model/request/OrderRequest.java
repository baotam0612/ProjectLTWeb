package com.jewellery.ProjWEB.admin.order.model.request;


import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderRequest {
    private String customerName;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String shippingAddress;


}
