package com.jewellery.ProjWEB.user.order.controller;

import com.jewellery.ProjWEB.user.order.model.dto.OrderRequest;
import com.jewellery.ProjWEB.user.order.service.UserOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/orders")
@RequiredArgsConstructor
public class UserOrderController {

    private final UserOrderService userOrderService;

    @PostMapping
    public ResponseEntity<String> placeOrder(@RequestBody OrderRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui long dang nhap de dat hang");
        }
        String username = authentication.getName();
        String result = userOrderService.placeOrder(request, username);
        return ResponseEntity.ok(result);
    }
}
