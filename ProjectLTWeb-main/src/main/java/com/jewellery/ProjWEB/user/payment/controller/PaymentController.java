package com.jewellery.ProjWEB.user.payment.controller;

import com.jewellery.ProjWEB.user.payment.model.PaymentRequest;
import com.jewellery.ProjWEB.user.payment.model.PaymentResponse;
import com.jewellery.ProjWEB.user.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController("userPaymentController") // Đánh dấu đây là một API Controller
@RequestMapping("/api/user/payment")     // Đường dẫn gốc của API
public class PaymentController {

    private final PaymentService paymentService;

    // Spring sẽ tự động tìm PaymentServiceImpl để đưa vào đây (DI)
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Hàm này dành cho Frontend gọi qua HTTP POST
     */
    @PostMapping("/checkout")
    public ResponseEntity<PaymentResponse> checkout(@RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processCheckout(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Hàm này bạn dùng để test nhanh trong code (giống hàm cũ của bạn)
     */
    public void performCheckout(int orderID, String method, BigDecimal amount) {
        PaymentRequest request = new PaymentRequest(orderID, method, amount);
        PaymentResponse response = paymentService.processCheckout(request);
        System.out.println("Thông báo từ hệ thống: " + response.getMessage());
    }
}