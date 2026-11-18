package com.colledge.backend.service;

import com.colledge.backend.entity.AttendanceRecord;
import com.colledge.backend.entity.AttendanceSession;
import com.colledge.backend.entity.User;
import com.colledge.backend.repository.AttendanceRecordRepository;
import com.colledge.backend.repository.AttendanceSessionRepository;
import com.colledge.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final UserRepository userRepository;

    public AttendanceService(
            AttendanceSessionRepository sessionRepository,
            AttendanceRecordRepository recordRepository,
            UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.userRepository = userRepository;
    }

    public AttendanceSession createSession(AttendanceSession session) {
        if (session.getCode() == null || session.getCode().isBlank()) {
            session.setCode(String.valueOf((int) (Math.random() * 900000) + 100000));
        }
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(Instant.now());
        }
        if (session.getTeacherId() == null) {
            session.setTeacherId(userRepository.findAll().stream().findFirst().map(User::getId).orElse(null));
        }
        session.setActive(true);
        return sessionRepository.save(session);
    }

    public List<AttendanceSession> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<AttendanceSession> getActiveSessions() {
        return sessionRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    @Transactional
    public AttendanceRecord checkIn(String code, UUID studentId, String studentName, String studentEmail) {
        AttendanceSession session = sessionRepository.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive session code: " + code));

        if (studentId != null && recordRepository.existsBySessionIdAndStudentId(session.getId(), studentId)) {
            throw new IllegalArgumentException("Attendance already marked for this session");
        } else if (studentEmail != null && recordRepository.existsBySessionIdAndStudentEmail(session.getId(), studentEmail)) {
            throw new IllegalArgumentException("Attendance already marked for this session");
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setSessionId(session.getId());
        record.setSubject(session.getSubject());
        record.setStudentId(studentId);
        record.setStudentName(studentName != null ? studentName : "Student");
        record.setStudentEmail(studentEmail);
        record.setTimestamp(Instant.now());
        record.setStatus("Present");

        return recordRepository.save(record);
    }

    public List<AttendanceRecord> getAllRecords() {
        return recordRepository.findAllByOrderByTimestampDesc();
    }

    public List<AttendanceRecord> getStudentRecords(UUID studentId) {
        return recordRepository.findByStudentIdOrderByTimestampDesc(studentId);
    }

    @Transactional
    public AttendanceSession closeSession(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        session.setActive(false);
        return sessionRepository.save(session);
    }
}
