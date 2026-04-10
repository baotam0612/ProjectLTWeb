package com.jewellery.ProjWEB.admin.payment.service;

import com.jewellery.ProjWEB.admin.payment.model.*;
import com.jewellery.ProjWEB.admin.payment.repository.AdminPaymentRepository;
import com.jewellery.ProjWEB.entity.OrderEntity;
import com.jewellery.ProjWEB.entity.PaymentEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final AdminPaymentRepository paymentRepository;

    public PaymentServiceImpl(AdminPaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Override
    public List<PaymentDTO> getAllPayment() {
        // Lấy danh sách Entity từ Database
        List<PaymentEntity> entities = paymentRepository.findAll();

        return entities.stream()
                .map(this::convertToDTO)
                .sorted((p1, p2) -> p2.getPaymentDate().compareTo(p1.getPaymentDate()))
                .collect(Collectors.toList());
    }

    private PaymentDTO convertToDTO(PaymentEntity entity) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(entity.getPaymentID());
        dto.setAmount(entity.getAmount());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setPaymentStatus(entity.getPaymentStatus().name());
        dto.setPaymentDate(entity.getPaymentDate());

        if (entity.getOrder() != null) {
            dto.setOrderId(entity.getOrder().getOrderID());
            // Lấy FullName từ Account thông qua Order
            if (entity.getOrder().getAccount() != null) {
                dto.setCustomerName(entity.getOrder().getAccount().getFullName());
            }
        }
        return dto;
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest req) {
        try {
            PaymentEntity entity = new PaymentEntity();
            entity.setAmount(req.getAmount());
            entity.setPaymentMethod(req.getPaymentMethod());
            // Ép kiểu String sang Enum (Lưu ý: phải khớp Success hoặc Failed)
            entity.setPaymentStatus(PaymentEntity.PaymentStatus.valueOf(req.getPaymentStatus()));
            entity.setPaymentDate(LocalDateTime.now());

            OrderEntity order = new OrderEntity();
            order.setOrderID(req.getOrderId());
            entity.setOrder(order);

            paymentRepository.save(entity);
            return new PaymentResponse(true, "Tạo thanh toán thành công cho đơn hàng #" + req.getOrderId());
        } catch (Exception e) {
            return new PaymentResponse(false, "Lỗi: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponse editPayment(PaymentRequest request) {
        return paymentRepository.findById(request.getPaymentId())
                .map(entity -> {
                    entity.setPaymentMethod(request.getPaymentMethod());
                    entity.setPaymentStatus(PaymentEntity.PaymentStatus.valueOf(request.getPaymentStatus()));
                    entity.setAmount(request.getAmount());
                    paymentRepository.save(entity);
                    return new PaymentResponse(true, "Cập nhật thành công");
                })
                .orElse(new PaymentResponse(false, "Không tìm thấy ID: " + request.getPaymentId()));
    }

    @Override
    @Transactional
    public PaymentResponse removePayment(int id) {
        if (paymentRepository.existsById(id)) {
            paymentRepository.deleteById(id);
            return new PaymentResponse(true, "Xóa thành công thanh toán ID: " + id);
        }
        return new PaymentResponse(false, "Không tìm thấy dữ liệu");
    }
}