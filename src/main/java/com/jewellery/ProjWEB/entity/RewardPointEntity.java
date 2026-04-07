package com.jewellery.ProjWEB.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "RewardPoint")
public class RewardPointEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer rewardPointID;

    private Integer points;
    private LocalDateTime updatedAt;
    private String note;

    @ManyToOne
    @JoinColumn(name = "AccountID")
    private AccountEntity account;

    public Integer getRewardPointID() {
        return rewardPointID;
    }

    public void setRewardPointID(Integer rewardPointID) {
        this.rewardPointID = rewardPointID;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public AccountEntity getAccount() {
        return account;
    }

    public void setAccount(AccountEntity account) {
        this.account = account;
    }
}