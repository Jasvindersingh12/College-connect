package com.colledge.backend.repository;

import com.colledge.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    Optional<Order> findByOrderCode(String orderCode);
}
