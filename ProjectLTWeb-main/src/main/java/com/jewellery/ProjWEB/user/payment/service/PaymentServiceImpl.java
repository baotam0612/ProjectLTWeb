package com.jewellery.ProjWEB.user.payment.service;

import com.jewellery.ProjWEB.entity.OrderEntity;
import com.jewellery.ProjWEB.entity.PaymentEntity;
import com.jewellery.ProjWEB.user.payment.model.PaymentRequest;
import com.jewellery.ProjWEB.user.payment.model.PaymentResponse;
import com.jewellery.ProjWEB.user.payment.repository.UserPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service("userPaymentService")
public class PaymentServiceImpl implements PaymentService {

    private final UserPaymentRepository paymentRepository;

    public PaymentServiceImpl(UserPaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional
    public PaymentResponse processCheckout(PaymentRequest request) {
        // 1. Kiểm tra tính hợp lệ của dữ liệu
        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return new PaymentResponse(false, "Số tiền thanh toán không hợp lệ.");
        }

        if (request.getPaymentMethod() == null || request.getPaymentMethod().isEmpty()) {
            return new PaymentResponse(false, "Vui lòng chọn phương thức thanh toán.");
        }

        try {
            // 2. Chuyển đổi từ Request sang Entity để lưu DB
            PaymentEntity payment = new PaymentEntity();
            payment.setAmount(request.getAmount());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setPaymentStatus(PaymentEntity.PaymentStatus.Success); // Giả định thanh toán thành công
            payment.setPaymentDate(LocalDateTime.now());

            // Gán mối quan hệ với đơn hàng
            OrderEntity order = new OrderEntity();
            order.setOrderID(request.getOrderId());
            payment.setOrder(order);

            // 3. Thực thi lưu vào Database
            paymentRepository.save(payment);

            return new PaymentResponse(true, "Thanh toán đơn hàng #" + request.getOrderId() + " thành công!");
        } catch (Exception e) {
            return new PaymentResponse(false, "Lỗi hệ thống khi xử lý thanh toán: " + e.getMessage());
        }
    }
}