package com.jewellery.ProjWEB.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payment")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentID;

    private String paymentMethod;

//    @Enumerated(EnumType.STRING)
//    private PaymentStatus paymentStatus;

    private LocalDateTime paymentDate;
    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "OrderID")
    private OrderEntity order;
}
