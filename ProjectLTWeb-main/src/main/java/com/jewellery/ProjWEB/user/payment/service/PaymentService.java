package com.jewellery.ProjWEB.user.payment.service;

import com.jewellery.ProjWEB.user.payment.model.PaymentRequest;
import com.jewellery.ProjWEB.user.payment.model.PaymentResponse;

public interface PaymentService {
    PaymentResponse processCheckout(PaymentRequest request);
}


