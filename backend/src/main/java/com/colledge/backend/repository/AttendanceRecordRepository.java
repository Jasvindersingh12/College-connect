package com.colledge.backend.repository;

import com.colledge.backend.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {
    List<AttendanceRecord> findAllByOrderByTimestampDesc();
    List<AttendanceRecord> findByStudentIdOrderByTimestampDesc(UUID studentId);
    List<AttendanceRecord> findBySessionIdOrderByTimestampDesc(UUID sessionId);
    boolean existsBySessionIdAndStudentId(UUID sessionId, UUID studentId);
    boolean existsBySessionIdAndStudentEmail(UUID sessionId, String studentEmail);
}
