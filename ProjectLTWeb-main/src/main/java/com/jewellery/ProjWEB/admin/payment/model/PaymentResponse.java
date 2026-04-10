package com.jewellery.ProjWEB.admin.payment.model;

public class PaymentResponse {
    private boolean success;
    private String message;

    public PaymentResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
}