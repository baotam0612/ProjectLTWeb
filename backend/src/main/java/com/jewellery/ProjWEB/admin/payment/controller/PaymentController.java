package com.jewellery.ProjWEB.admin.payment.controller;

import com.jewellery.ProjWEB.admin.pagination.AdminListService;
import com.jewellery.ProjWEB.admin.pagination.PageQuery;
import com.jewellery.ProjWEB.admin.pagination.PageResponse;
import com.jewellery.ProjWEB.admin.Response.Response;
import com.jewellery.ProjWEB.admin.payment.model.PaymentDTO;
import com.jewellery.ProjWEB.admin.payment.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class PaymentController {
    private final AdminListService lists;

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService, AdminListService lists) {
        this.lists = lists;
        this.paymentService = paymentService;
    }

    @GetMapping(value = "/payments", params = "page")
    public PageResponse<PaymentDTO> pagedList(@ModelAttribute PageQuery query) {
        return lists.payments(query);
    }

    @GetMapping(value = "/payments", params = "!page")
    public Response getAllPayments() {
        try {
            List<PaymentDTO> payments = paymentService.findAll();
            return new Response(HttpStatus.OK, "Query All Payments Success!", payments);
        } catch (Exception e) {
            return new Response(HttpStatus.INTERNAL_SERVER_ERROR, "Error: " + e.getMessage(), null);
        }
    }

    @PutMapping("/payments/{id}/status")
    public Response updatePaymentStatus(@PathVariable("id") Integer id, @RequestParam("status") String status) {
        try {
            PaymentDTO updated = paymentService.updatePaymentStatus(id, status);
            return new Response(HttpStatus.OK, "Payment status updated successfully!", updated);
        } catch (Exception e) {
            return new Response(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }

    @DeleteMapping("/payments/{id}")
    public Response deletePayment(@PathVariable("id") Integer id) {
        try {
            paymentService.deletePayment(id);
            return new Response(HttpStatus.OK, "Payment deleted successfully!", null);
        } catch (RuntimeException e) {
            return new Response(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}
