package com.jewellery.ProjWEB.user.product.model;

import java.math.BigDecimal;
import java.util.List;

public class ProductDTO {
    private Integer id;
    private Integer quantity;
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    private String productName;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private List<ProductDetailDTO> productDetails;

    public ProductDTO() {
    }

    public ProductDTO(Integer id, String productName, String description, BigDecimal price, String imageUrl) {
        this.id = id;
        this.productName = productName;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<ProductDetailDTO> getProductDetails() {
        return productDetails;
    }

    public void setProductDetails(List<ProductDetailDTO> productDetails) {
        this.productDetails = productDetails;
    }
}
