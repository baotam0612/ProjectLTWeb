package com.jewellery.ProjWEB.admin.payment.controller;

import com.jewellery.ProjWEB.admin.payment.model.*;
import com.jewellery.ProjWEB.admin.payment.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<PaymentDTO> getList() {
        return paymentService.getAllPayment();
    }

    @PostMapping
    public PaymentResponse addPayment(@RequestBody PaymentRequest req) {
        return paymentService.createPayment(req);
    }

    @PutMapping
    public PaymentResponse updatePayment(@RequestBody PaymentRequest req) {
        return paymentService.editPayment(req);
    }

    @DeleteMapping("/{id}")
    public PaymentResponse deletePayment(@PathVariable int id) {
        return paymentService.removePayment(id);
    }
}