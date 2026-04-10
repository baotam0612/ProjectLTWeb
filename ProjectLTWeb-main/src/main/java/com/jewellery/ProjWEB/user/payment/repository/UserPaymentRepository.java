package com.jewellery.ProjWEB.user.payment.repository;

import com.jewellery.ProjWEB.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPaymentRepository extends JpaRepository<PaymentEntity, Integer> {
}
