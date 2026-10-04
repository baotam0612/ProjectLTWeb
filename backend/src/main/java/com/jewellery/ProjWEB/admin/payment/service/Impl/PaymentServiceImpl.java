package com.jewellery.ProjWEB.admin.payment.service.Impl;

import com.jewellery.ProjWEB.admin.payment.model.PaymentDTO;
import com.jewellery.ProjWEB.admin.payment.repository.PaymentRepository;
import com.jewellery.ProjWEB.admin.payment.service.PaymentService;
import com.jewellery.ProjWEB.entity.PaymentEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ModelMapper modelMapper;

    public PaymentServiceImpl(PaymentRepository paymentRepository, ModelMapper modelMapper) {
        this.paymentRepository = paymentRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<PaymentDTO> findAll() {
        List<PaymentEntity> entities = paymentRepository.findAll();
        List<PaymentDTO> dtos = new ArrayList<>();
        for (PaymentEntity item : entities) {
            PaymentDTO dto = modelMapper.map(item, PaymentDTO.class);
            if(item.getOrder() != null) {
                dto.setOrderID(item.getOrder().getOrderID());
            }
            dtos.add(dto);
        }
        return dtos;
    }

    @Override
    public PaymentDTO findById(Integer id) {
        PaymentEntity entity = paymentRepository.findById(id).orElse(null);
        if (entity != null) {
            PaymentDTO dto = modelMapper.map(entity, PaymentDTO.class);
            if(entity.getOrder() != null) {
                dto.setOrderID(entity.getOrder().getOrderID());
            }
            return dto;
        }
        return null;
    }

    @Override
    public PaymentDTO updatePaymentStatus(Integer id, String status) {
        PaymentEntity entity = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment Not Found with id: " + id));
        entity.setPaymentStatus(status);
        paymentRepository.save(entity);
        
        PaymentDTO dto = modelMapper.map(entity, PaymentDTO.class);
        if(entity.getOrder() != null) {
            dto.setOrderID(entity.getOrder().getOrderID());
        }
        return dto;
    }

    @Override
    public void deletePayment(Integer id) {
        PaymentEntity entity = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment Not Found with id: " + id));
        paymentRepository.delete(entity);
    }
}
