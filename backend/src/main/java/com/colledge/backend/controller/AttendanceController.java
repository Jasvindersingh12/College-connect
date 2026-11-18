package com.colledge.backend.controller;

import com.colledge.backend.entity.AttendanceRecord;
import com.colledge.backend.entity.AttendanceSession;
import com.colledge.backend.service.AttendanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/sessions")
    public ResponseEntity<AttendanceSession> createSession(
            @RequestBody AttendanceSession session,
            Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            try {
                session.setTeacherId(UUID.fromString(authentication.getName()));
            } catch (Exception ignored) {}
        }
        AttendanceSession created = attendanceService.createSession(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/sessions")
    public List<AttendanceSession> getSessions(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        return activeOnly ? attendanceService.getActiveSessions() : attendanceService.getAllSessions();
    }

    @PatchMapping("/sessions/{id}/close")
    public ResponseEntity<AttendanceSession> closeSession(@PathVariable UUID id) {
        return ResponseEntity.ok(attendanceService.closeSession(id));
    }

    @PostMapping("/check-in")
    public ResponseEntity<AttendanceRecord> checkIn(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String code = payload.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        UUID studentId = null;
        if (authentication != null && authentication.getName() != null) {
            try {
                studentId = UUID.fromString(authentication.getName());
            } catch (Exception ignored) {}
        }
        if (studentId == null && payload.get("studentId") != null) {
            try {
                studentId = UUID.fromString(payload.get("studentId"));
            } catch (Exception ignored) {}
        }

        String studentName = payload.get("studentName");
        String studentEmail = payload.get("studentEmail");

        AttendanceRecord record = attendanceService.checkIn(code, studentId, studentName, studentEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(record);
    }

    @GetMapping("/records")
    public List<AttendanceRecord> getRecords(
            @RequestParam(required = false) UUID studentId,
            Authentication authentication) {
        if (studentId != null) {
            return attendanceService.getStudentRecords(studentId);
        }
        if (authentication != null && authentication.getName() != null) {
            try {
                UUID authUserId = UUID.fromString(authentication.getName());
                return attendanceService.getStudentRecords(authUserId);
            } catch (Exception ignored) {}
        }
        return attendanceService.getAllRecords();
    }
}
