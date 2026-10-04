package com.jewellery.ProjWEB.user.order.service.Impl;

import com.jewellery.ProjWEB.entity.AccountEntity;
import com.jewellery.ProjWEB.entity.OrderDetailEntity;
import com.jewellery.ProjWEB.entity.OrderEntity;
import com.jewellery.ProjWEB.entity.PaymentEntity;
import com.jewellery.ProjWEB.entity.ProductEntity;
import com.jewellery.ProjWEB.user.entity.User;
import com.jewellery.ProjWEB.user.order.model.dto.OrderRequest;
import com.jewellery.ProjWEB.user.order.service.UserOrderService;
import com.jewellery.ProjWEB.user.product.repository.UserProductRepository;
import com.jewellery.ProjWEB.user.repository.AccountRepository;
import com.jewellery.ProjWEB.user.repository.UserRepository;
import com.jewellery.ProjWEB.admin.order.repository.OrderRepository;
import com.jewellery.ProjWEB.admin.payment.repository.PaymentRepository;
import com.jewellery.ProjWEB.admin.order.repository.OrderDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserOrderServiceImpl implements UserOrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final UserProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public String placeOrder(OrderRequest request, String username) {
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new IllegalArgumentException("Số lượng đặt hàng phải là số nguyên dương");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProductEntity product = productRepository.findForUpdate(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!"Available".equalsIgnoreCase(product.getStatus()) || product.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Sản phẩm không đủ tồn kho hoặc đang ngừng bán");
        }
        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);

        AccountEntity account = accountRepository.findByUserId(user.getId())
                .or(() -> accountRepository.findByUsername(user.getUsername()))
                .orElseGet(() -> {
                    AccountEntity created = new AccountEntity();
                    created.setUser(user);
                    created.setUsername(user.getUsername());
                    created.setFullName(user.getFullName());
                    created.setAddress(user.getAddress());
                    created.setPhoneNumber(user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
                    created.setPassword(user.getPassword());
                    created.setCreatedAt(LocalDateTime.now());
                    return accountRepository.save(created);
                });

        OrderEntity order = new OrderEntity();
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("Pending");
        order.setInventoryReserved(true);
        order.setShippingAddress(request.getShippingAddress());
        order.setAccount(account);

        BigDecimal price = product.getPrice();
        BigDecimal total = price.multiply(new BigDecimal(request.getQuantity()));
        order.setTotalAmount(total);

        order = orderRepository.save(order);

        // Create detail
        OrderDetailEntity detail = new OrderDetailEntity();
        detail.setOrder(order);
        detail.setProduct(product);
        detail.setQuantity(request.getQuantity());
        detail.setPrice(price);
        detail.setTotalAmount(total);
        orderDetailRepository.save(detail);

        // Create payment
        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setAmount(total);
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Thanh toán khi nhận hàng");
        payment.setPaymentStatus("Failed");
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        return "Order placed successfully! Order ID: " + order.getOrderID();
    }
}
