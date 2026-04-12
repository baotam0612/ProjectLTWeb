package com.jewellery.ProjWEB.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "Material")
public class MaterialEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer materialID;

    private String materialName;
    private String composition;
    private String weight;
    private String purity;
    private String unit;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaterialPriceEntity> prices;

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

    public String getComposition() {
        return composition;
    }

    public void setComposition(String composition) {
        this.composition = composition;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }

    public String getPurity() {
        return purity;
    }

    public void setPurity(String purity) {
        this.purity = purity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public List<MaterialPriceEntity> getPrices() {
        return prices;
    }

    public void setPrices(List<MaterialPriceEntity> prices) {
        this.prices = prices;
    }
}