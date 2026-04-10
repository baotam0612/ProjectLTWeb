package com.jewellery.ProjWEB.admin.order.model.dto;

import com.jewellery.ProjWEB.entity.OrderEntity;
import com.jewellery.ProjWEB.entity.ProductEntity;

import java.math.BigDecimal;

public class OrderDetailDTO {
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;
    private OrderEntity order;
    private ProductEntity product;

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderEntity getOrder() {
        return order;
    }

    public void setOrder(OrderEntity order) {
        this.order = order;
    }

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }
}
