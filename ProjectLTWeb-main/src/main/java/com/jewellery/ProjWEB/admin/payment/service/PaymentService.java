package com.jewellery.ProjWEB.admin.payment.service;

import com.jewellery.ProjWEB.admin.payment.model.*;
import java.util.List;

public interface PaymentService {
    List<PaymentDTO> getAllPayment();
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse editPayment(PaymentRequest request);
    PaymentResponse removePayment(int id);
}