package com.colledge.backend.controller;

import com.colledge.backend.dto.CreateOrderRequest;
import com.colledge.backend.entity.Order;
import com.colledge.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        UUID studentId = null;
        if (authentication != null && authentication.getName() != null) {
            try {
                studentId = UUID.fromString(authentication.getName());
            } catch (Exception ignored) {}
        }
        Order created = orderService.createOrder(request, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/my")
    public List<Order> getMyOrders(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            try {
                UUID studentId = UUID.fromString(authentication.getName());
                return orderService.getOrdersByStudent(studentId);
            } catch (Exception ignored) {}
        }
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        Object statusObj = body.get("status");
        if (statusObj == null) {
            return ResponseEntity.badRequest().build();
        }
        short status = Short.parseShort(statusObj.toString());
        Order updated = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
