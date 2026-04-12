package com.jewellery.ProjWEB.admin.payment.service;

import com.jewellery.ProjWEB.admin.payment.model.PaymentDTO;
import java.util.List;

public interface PaymentService {
    List<PaymentDTO> findAll();
    PaymentDTO findById(Integer id);
    void deletePayment(Integer id);
}
