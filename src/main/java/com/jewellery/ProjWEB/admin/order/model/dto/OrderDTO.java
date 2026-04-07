package com.jewellery.ProjWEB.admin.order.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDTO {
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String shippingAddress;

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
