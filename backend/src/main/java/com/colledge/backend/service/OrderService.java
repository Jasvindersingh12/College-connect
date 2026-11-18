package com.colledge.backend.service;

import com.colledge.backend.dto.CreateOrderRequest;
import com.colledge.backend.dto.OrderItemRequest;
import com.colledge.backend.entity.Order;
import com.colledge.backend.entity.OrderItem;
import com.colledge.backend.entity.User;
import com.colledge.backend.repository.OrderRepository;
import com.colledge.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order createOrder(CreateOrderRequest request, UUID studentIdFromAuth) {
        Order order = new Order();

        if (request.getOrderCode() != null && !request.getOrderCode().isBlank()) {
            order.setOrderCode(request.getOrderCode());
        } else {
            order.setOrderCode("CC" + (System.currentTimeMillis() % 100000));
        }

        UUID resolvedStudentId = studentIdFromAuth != null ? studentIdFromAuth : request.getStudentId();
        if (resolvedStudentId == null) {
            resolvedStudentId = userRepository.findAll().stream().findFirst().map(User::getId).orElse(null);
        }
        order.setStudentId(resolvedStudentId);
        order.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Student");
        order.setCustomerRole(request.getCustomerRole() != null ? request.getCustomerRole() : "student");
        order.setDeliveryMethod(request.getDeliveryMethod() != null ? request.getDeliveryMethod() : "pickup");
        order.setClassroom(request.getClassroom());
        order.setPickupTime(request.getPickupTime());
        order.setStatus((short) 0);

        BigDecimal calculatedSubtotal = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (OrderItemRequest itemReq : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setName(itemReq.getName() != null ? itemReq.getName() : "Item");
                item.setQuantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1);
                item.setPrice(itemReq.getPrice() != null ? itemReq.getPrice() : BigDecimal.ZERO);
                item.setLineTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                item.setMenuItemId(itemReq.getMenuItemId());
                order.addItem(item);

                calculatedSubtotal = calculatedSubtotal.add(
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                );
            }
        }

        order.setSubtotal(request.getSubtotal() != null ? request.getSubtotal() : calculatedSubtotal);
        BigDecimal fee = "delivery".equalsIgnoreCase(order.getDeliveryMethod()) ? BigDecimal.valueOf(20) : BigDecimal.ZERO;
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : fee);
        order.setTotal(request.getTotal() != null ? request.getTotal() : order.getSubtotal().add(order.getDeliveryFee()));

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByStudent(UUID studentId) {
        return orderRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public Optional<Order> getOrderById(UUID id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByCode(String code) {
        return orderRepository.findByOrderCode(code);
    }

    @Transactional
    public Order updateOrderStatus(UUID id, Short status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
