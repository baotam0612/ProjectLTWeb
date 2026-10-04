package com.jewellery.ProjWEB.admin.payment.repository;

import com.jewellery.ProjWEB.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Integer>, JpaSpecificationExecutor<PaymentEntity> {
    long countByPaymentStatusIgnoreCase(String status);

    @org.springframework.data.jpa.repository.Query("select sum(p.amount) from PaymentEntity p")
    java.math.BigDecimal totalAmount();
}
