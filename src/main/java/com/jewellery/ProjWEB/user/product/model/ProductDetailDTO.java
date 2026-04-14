package com.jewellery.ProjWEB.user.product.model;

import java.math.BigDecimal;

public class ProductDetailDTO {
    private Integer productDetailID;
    private BigDecimal referenceWeight;
    private String composition;
    private String detailDescription;
    private Integer stockQuantity;
    private Integer materialID;
    private String materialName;

    public Integer getProductDetailID() {
        return productDetailID;
    }

    public void setProductDetailID(Integer productDetailID) {
        this.productDetailID = productDetailID;
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

    public Integer getMaterialID() {
        return materialID;
    }

    public void setMaterialID(Integer materialID) {
        this.materialID = materialID;
    }

    public String getMaterialName() {
        return materialName;
    }

    public void setMaterialName(String materialName) {
        this.materialName = materialName;
    }
}
