package com.jewellery.ProjWEB.admin.order.service.Impl;

import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import com.jewellery.ProjWEB.admin.order.model.dto.OrderDetailDTO;
import com.jewellery.ProjWEB.admin.order.repository.OrderRepository;
import com.jewellery.ProjWEB.admin.order.service.OrderService;
import com.jewellery.ProjWEB.admin.product.repository.ProductRepository;
import com.jewellery.ProjWEB.entity.AccountEntity;
import com.jewellery.ProjWEB.entity.OrderDetailEntity;
import com.jewellery.ProjWEB.entity.OrderEntity;
import com.jewellery.ProjWEB.entity.ProductDetailEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public OrderServiceImpl(OrderRepository orderRepository, ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> findAll() {
        List<OrderEntity> orderEntityList = orderRepository.findAll();
        return orderEntityList.stream().map(this::toDTO).toList();
    }

    @Override
    public OrderDTO toDTO(OrderEntity item) {
        OrderDTO orderDTO = new OrderDTO();

        // Set basic order fields
        orderDTO.setOrderId(item.getOrderID());
        orderDTO.setOrderDate(item.getOrderDate());
        orderDTO.setTotalAmount(item.getTotalAmount());
        orderDTO.setOrderStatus(item.getOrderStatus());
        orderDTO.setShippingAddress(item.getShippingAddress());
        orderDTO.setUserName(resolveCustomerName(item.getAccount()));

        // Map order details
        if (item.getOrderDetails() != null && !item.getOrderDetails().isEmpty()) {
            List<OrderDetailDTO> orderDetailDTOs = new ArrayList<>();

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
                        detailDTO.setStockQuantity(detail.getProduct().getQuantity());
                        
                        if (detail.getProduct().getProductDetails() != null && !detail.getProduct().getProductDetails().isEmpty()) {
                            ProductDetailEntity pd = detail.getProduct().getProductDetails().get(0);
                            detailDTO.setProductDetailID(pd.getProductDetailID());
                            if (pd.getMaterial() != null) {
                                detailDTO.setMaterialID(pd.getMaterial().getMaterialID());
                            }
                            detailDTO.setReferenceWeight(pd.getReferenceWeight());
                            detailDTO.setComposition(pd.getComposition());
                            detailDTO.setDetailDescription(pd.getDetailDescription());
                        }
                    }

                    orderDetailDTOs.add(detailDTO);
                }
            }

            orderDTO.setOrderDetails(orderDetailDTOs);
        }

        return orderDTO;
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Integer orderId, String status) {
        OrderEntity order = orderRepository.findForUpdate(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        if (!java.util.Set.of("Pending", "Completed", "Canceled").contains(status)) {
            throw new IllegalArgumentException("Trạng thái đơn hàng không hợp lệ");
        }
        boolean wasCanceled = "Canceled".equalsIgnoreCase(order.getOrderStatus()) || "Cancelled".equalsIgnoreCase(order.getOrderStatus());
        if ("Canceled".equals(status) && order.isInventoryReserved()) {
            adjustInventory(order, false);
            order.setInventoryReserved(false);
        } else if (!"Canceled".equals(status) && wasCanceled) {
            adjustInventory(order, true);
            order.setInventoryReserved(true);
        }
        order.setOrderStatus(status);
        order = orderRepository.save(order);

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderId(order.getOrderID());
        orderDTO.setOrderStatus(order.getOrderStatus());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setTotalAmount(order.getTotalAmount());
        orderDTO.setShippingAddress(order.getShippingAddress());
        orderDTO.setUserName(resolveCustomerName(order.getAccount()));

        return orderDTO;
    }

    private void adjustInventory(OrderEntity order, boolean reserve) {
        // Lock products in a stable order to avoid deadlocks for multi-product orders.
        var quantities = new java.util.TreeMap<Integer, Integer>();
        for (OrderDetailEntity detail : order.getOrderDetails()) {
            quantities.merge(detail.getProduct().getId(), detail.getQuantity(), Math::addExact);
        }
        for (var entry : quantities.entrySet()) {
            var product = productRepository.findForUpdate(entry.getKey()).orElseThrow();
            // Order details may have loaded the product before acquiring its lock.
            entityManager.refresh(product, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
            int quantity = entry.getValue();
            if (reserve && (!"Available".equalsIgnoreCase(product.getStatus()) || product.getQuantity() < quantity)) {
                throw new IllegalArgumentException("Không đủ tồn kho để mở lại đơn hàng");
            }
            product.setQuantity(reserve ? product.getQuantity() - quantity : Math.addExact(product.getQuantity(), quantity));
            productRepository.save(product);
        }
    }

    private String resolveCustomerName(AccountEntity account) {
        if (account == null) {
            return null;
        }

        if (hasText(account.getFullName())) {
            return account.getFullName();
        }

        if (account.getUser() != null && hasText(account.getUser().getFullName())) {
            return account.getUser().getFullName();
        }

        if (hasText(account.getUsername())) {
            return account.getUsername();
        }

        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
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
