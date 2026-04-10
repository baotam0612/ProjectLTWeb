package com.jewellery.ProjWEB.user.payment.model;

import java.math.BigDecimal;

public class PaymentRequest {
    private int orderId;
    private String paymentMethod;
    private BigDecimal amount;

    public PaymentRequest() {}

    public PaymentRequest(int orderId, String paymentMethod, BigDecimal amount) {
        this.orderId = orderId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
    }

    public int getOrderId() { return orderId; }
    public void setOrderId(int orderId) { this.orderId = orderId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
