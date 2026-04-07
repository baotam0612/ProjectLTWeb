package com.jewellery.ProjWEB.admin.category.model;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {

    @NotBlank(message = "CategoryName be nesscessary!")
    private String categoryName;

    private String description;

    @NotBlank(message = "status be nesscessary!")
    private String status;


    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
