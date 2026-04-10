package com.jewellery.ProjWEB.admin.payment.repository;

import com.jewellery.ProjWEB.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminPaymentRepository extends JpaRepository<PaymentEntity, Integer> {
}
