package com.jewellery.ProjWEB.entity;

import com.jewellery.ProjWEB.user.entity.User;
import jakarta.persistence.*;

import javax.management.relation.Role;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Account")
public class AccountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountID;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false  )
    private String password;

    private String email;
    private String phoneNumber;
    private String fullName;
    private String address;

//    @Enumerated(EnumType.STRING)
//    private Role role;



    private LocalDateTime createdAt;

    // RELATIONSHIP
    @OneToMany(mappedBy = "account")
    private List<OrderEntity> orders;

    @OneToMany(mappedBy = "account")
    private List<CartEntity> carts;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user ;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getAccountID() {
        return accountID;
    }

    public void setAccountID(Long accountID) {
        this.accountID = accountID;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
//
//    public Role getRole() {
//        return role;
//    }
//
//    public void setRole(Role role) {
//        this.role = role;
//    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<OrderEntity> getOrders() {
        return orders;
    }

    public void setOrders(List<OrderEntity> orders) {
        this.orders = orders;
    }

    public List<CartEntity> getCarts() {
        return carts;
    }

    public void setCarts(List<CartEntity> carts) {
        this.carts = carts;
    }
}