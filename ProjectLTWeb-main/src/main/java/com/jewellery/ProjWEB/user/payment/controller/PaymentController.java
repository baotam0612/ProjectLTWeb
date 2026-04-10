package com.jewellery.ProjWEB.user.payment.controller;

import com.jewellery.ProjWEB.user.payment.model.PaymentRequest;
import com.jewellery.ProjWEB.user.payment.model.PaymentResponse;
import com.jewellery.ProjWEB.user.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController("userPaymentController") 
@RequestMapping("/api/user/payment")     
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<PaymentResponse> checkout(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processCheckout(request);
        return ResponseEntity.ok(response);
    }

    public void performCheckout(int orderID, String method, BigDecimal amount) {
        PaymentRequest request = new PaymentRequest(orderID, method, amount);
        PaymentResponse response = paymentService.processCheckout(request);
        System.out.println("Thông báo từ hệ thống: " + response.getMessage());
    }
}
