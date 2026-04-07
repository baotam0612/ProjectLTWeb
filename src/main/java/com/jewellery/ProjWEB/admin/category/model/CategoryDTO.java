package com.jewellery.ProjWEB.admin.category.model;

import com.jewellery.ProjWEB.entity.ProductEntity;
import jakarta.persistence.*;

import java.util.List;

public class CategoryDTO {


    private String categoryName;
    private String description;
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
