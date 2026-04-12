package com.jewellery.ProjWEB.admin.order.service.Impl;

import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import com.jewellery.ProjWEB.admin.order.model.dto.OrderDetailDTO;
import com.jewellery.ProjWEB.admin.order.repository.OrderRepository;
import com.jewellery.ProjWEB.admin.order.service.OrderService;
import com.jewellery.ProjWEB.entity.OrderDetailEntity;
import com.jewellery.ProjWEB.entity.OrderEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> findAll() {
        List<OrderEntity> orderEntityList = orderRepository.findAll();
        List<OrderDTO> orderDTOList = new ArrayList<>();

        for (OrderEntity item : orderEntityList) {
            OrderDTO orderDTO = new OrderDTO();

            // Set basic order fields
            orderDTO.setOrderId(item.getOrderID());
            orderDTO.setOrderDate(item.getOrderDate());
            orderDTO.setTotalAmount(item.getTotalAmount());
            orderDTO.setOrderStatus(item.getOrderStatus());
            orderDTO.setShippingAddress(item.getShippingAddress());

            // Map order details
            if (item.getOrderDetails() != null && !item.getOrderDetails().isEmpty()) {
                List<OrderDetailDTO> orderDetailDTOs = new ArrayList<>();
                int totalQuantity = 0;

                // Get first product info for productName and price
                OrderDetailEntity firstDetail = item.getOrderDetails().get(0);
                if (firstDetail != null && firstDetail.getProduct() != null) {
                    orderDTO.setProductName(firstDetail.getProduct().getProductName());
                    orderDTO.setPrice(firstDetail.getPrice());
                }

                // Map all order details and calculate total quantity
                for (OrderDetailEntity detail : item.getOrderDetails()) {
                    if (detail != null) {
                        OrderDetailDTO detailDTO = new OrderDetailDTO();
                        detailDTO.setQuantity(detail.getQuantity());
                        detailDTO.setPrice(detail.getPrice());
                        detailDTO.setTotalAmount(detail.getTotalAmount());

                        if (detail.getProduct() != null) {
                            detailDTO.setProductName(detail.getProduct().getProductName());
                            detailDTO.setProductID(detail.getProduct().getId());
                            
                            if (detail.getProduct().getProductDetails() != null && !detail.getProduct().getProductDetails().isEmpty()) {
                                com.jewellery.ProjWEB.entity.ProductDetailEntity pd = detail.getProduct().getProductDetails().get(0);
                                detailDTO.setProductDetailID(pd.getProductDetailID());
                                if (pd.getMaterial() != null) {
                                    detailDTO.setMaterialID(pd.getMaterial().getMaterialID());
                                }
                                detailDTO.setReferenceWeight(pd.getReferenceWeight());
                                detailDTO.setComposition(pd.getComposition());
                                detailDTO.setDetailDescription(pd.getDetailDescription());
                                detailDTO.setStockQuantity(pd.getStockQuantity());
                            }
                        }

                        // Sum quantities
                        if (detail.getQuantity() != null) {
                            totalQuantity += detail.getQuantity();
                        }

                        orderDetailDTOs.add(detailDTO);
                    }
                }

                orderDTO.setOrderDetails(orderDetailDTOs);
                // Note: items field will be set on frontend calculation from totalQuantity
            }

            orderDTOList.add(orderDTO);
        }
        return orderDTOList;
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Integer orderId, String status) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setOrderStatus(status);
        order = orderRepository.save(order);

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderId(order.getOrderID());
        orderDTO.setOrderStatus(order.getOrderStatus());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setShippingAddress(order.getShippingAddress());

        return orderDTO;
    }

    @Override
    @Transactional
    public void deleteOrder(Integer orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        if (!"unactive".equalsIgnoreCase(order.getOrderStatus())) {
            throw new RuntimeException("Cannot delete order. Status must be 'unactive'.");
        }
        
        orderRepository.delete(order);
    }
}
