package com.jewellery.ProjWEB.admin.order.model.dto;

import com.jewellery.ProjWEB.entity.OrderEntity;
import com.jewellery.ProjWEB.entity.ProductEntity;

import java.math.BigDecimal;

public class OrderDetailDTO {
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;
    private String productName;

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

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

    private Integer productDetailID;
    private Integer productID;
    private Integer materialID;
    private BigDecimal referenceWeight;
    private String composition;
    private String detailDescription;
    private Integer stockQuantity;

    public Integer getProductDetailID() {
        return productDetailID;
    }

    public void setProductDetailID(Integer productDetailID) {
        this.productDetailID = productDetailID;
    }

    public Integer getProductID() {
        return productID;
    }

    public void setProductID(Integer productID) {
        this.productID = productID;
    }

    public Integer getMaterialID() {
        return materialID;
    }

    public void setMaterialID(Integer materialID) {
        this.materialID = materialID;
    }

    public BigDecimal getReferenceWeight() {
        return referenceWeight;
    }

    public void setReferenceWeight(BigDecimal referenceWeight) {
        this.referenceWeight = referenceWeight;
    }

    public String getComposition() {
        return composition;
    }

    public void setComposition(String composition) {
        this.composition = composition;
    }

    public String getDetailDescription() {
        return detailDescription;
    }

    public void setDetailDescription(String detailDescription) {
        this.detailDescription = detailDescription;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

}
