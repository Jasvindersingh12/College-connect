package com.colledge.backend.repository;

import com.colledge.backend.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {
    List<AttendanceSession> findAllByOrderByCreatedAtDesc();
    List<AttendanceSession> findByActiveTrueOrderByCreatedAtDesc();
    Optional<AttendanceSession> findByCodeAndActiveTrue(String code);
}
