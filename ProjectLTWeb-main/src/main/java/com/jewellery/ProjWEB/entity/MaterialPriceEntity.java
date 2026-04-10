package com.jewellery.ProjWEB.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "MaterialPrice")
public class MaterialPriceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer materialPriceID;

    private BigDecimal price;
    private LocalDate effectiveDate;

    @ManyToOne
    @JoinColumn(name = "MaterialID")
    private MaterialEntity material;

    public Integer getMaterialPriceID() {
        return materialPriceID;
    }

    public void setMaterialPriceID(Integer materialPriceID) {
        this.materialPriceID = materialPriceID;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public MaterialEntity getMaterial() {
        return material;
    }

    public void setMaterial(MaterialEntity material) {
        this.material = material;
    }
}