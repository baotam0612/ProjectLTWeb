package com.jewellery.ProjWEB.admin.order.controller;

import com.jewellery.ProjWEB.admin.pagination.AdminListService;
import com.jewellery.ProjWEB.admin.pagination.PageQuery;
import com.jewellery.ProjWEB.admin.pagination.PageResponse;
import com.jewellery.ProjWEB.admin.order.model.dto.OrderDTO;
import com.jewellery.ProjWEB.admin.order.model.dto.OrderDetailDTO;
import com.jewellery.ProjWEB.admin.order.model.request.OrderRequest;
import com.jewellery.ProjWEB.admin.order.model.response.OrderResponse;
import com.jewellery.ProjWEB.admin.order.service.OrderDetailService;
import com.jewellery.ProjWEB.admin.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class OrderController {
    private final AdminListService lists;
    private final OrderService orderService;
    private final OrderDetailService orderDetailService;

    public OrderController(OrderService orderService, OrderDetailService orderDetailService, AdminListService lists) {
        this.lists = lists;
        this.orderService = orderService;
        this.orderDetailService = orderDetailService;
    }

    // Trang chu order
    @GetMapping(value = "/orders", params = "page")
    public PageResponse<OrderDTO> pagedList(@ModelAttribute PageQuery query) {
        return lists.orders(query);
    }

    @GetMapping(value = "/orders", params = "!page")
    public OrderResponse orderPage() {
        List<OrderDTO> listOrderDTO = orderService.findAll();
        return new OrderResponse(HttpStatus.OK, "All Orders!", listOrderDTO);
    }

    // Trang chi tiet don hang
    @GetMapping("/orders/detail")
    public OrderResponse orderDetailPage() {
        List<OrderDetailDTO> listOrderDetailDTO = orderDetailService.findAll();
        return new OrderResponse(HttpStatus.OK, "All OrderDetails!", listOrderDetailDTO);
    }

    @PutMapping("/orders/{id}")
    public OrderResponse updateOrderStatus(@PathVariable("id") Integer id, @RequestBody OrderDTO orderDTO) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, orderDTO.getOrderStatus());
        return new OrderResponse(HttpStatus.OK, "Order status updated successfully!", List.of(updatedOrder));
    }

    @DeleteMapping("/orders/{id}")
    public OrderResponse deleteOrder(@PathVariable("id") Integer id) {
        try {
            orderService.deleteOrder(id);
            return new OrderResponse(HttpStatus.OK, "Order deleted successfully!", null);
        } catch (RuntimeException e) {
            return new OrderResponse(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        }
    }
}
