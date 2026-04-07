package com.jewellery.ProjWEB.admin.order.service.Impl;


import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import com.jewellery.ProjWEB.admin.order.model.dto.OrderDetailDTO;
import com.jewellery.ProjWEB.admin.order.repository.OrderDetailRepository;
import com.jewellery.ProjWEB.admin.order.service.OrderDetailService;
import com.jewellery.ProjWEB.entity.OrderDetailEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderDetailServiceImpl implements OrderDetailService {
    private final OrderDetailRepository orderDetailRepository;
    private ModelMapper modelMapper;

    public OrderDetailServiceImpl(OrderDetailRepository orderDetailRepository,ModelMapper modelMapper){
        this.orderDetailRepository = orderDetailRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<OrderDetailDTO> findAll() {
        List<OrderDetailEntity> orderDetailEntityList = orderDetailRepository.findAll();
        List<OrderDetailDTO> orderDetailDTOList = new ArrayList<>();
        for(OrderDetailEntity item : orderDetailEntityList){
            orderDetailDTOList.add(modelMapper.map(item, OrderDetailDTO.class));
        }
        return orderDetailDTOList;
    }
}
