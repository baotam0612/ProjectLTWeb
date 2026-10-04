package com.jewellery.ProjWEB.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ProductDetail")
public class ProductDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer productDetailID;

    private BigDecimal referenceWeight;
    private String composition;
    private String detailDescription;
    // Legacy stock retained for migration/audit. Runtime inventory is ProductEntity.quantity.
    private Integer stockQuantity;

    @ManyToOne
    @JoinColumn(name = "ProductID")
    private ProductEntity product;

    @ManyToOne
    @JoinColumn(name = "MaterialID")
    private MaterialEntity material;

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

    public ProductEntity getProduct() {
        return product;
    }

    public void setProduct(ProductEntity product) {
        this.product = product;
    }

    public MaterialEntity getMaterial() {
        return material;
    }

    public void setMaterial(MaterialEntity material) {
        this.material = material;
    }
}
