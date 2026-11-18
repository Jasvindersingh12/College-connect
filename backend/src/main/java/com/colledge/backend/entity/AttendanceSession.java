package com.colledge.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "attendance_sessions")
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String subject;

    private String room;

    @Column(name = "session_code", nullable = false)
    private String code;

    @Column(name = "code")
    private String legacyCode;

    @Column(name = "created_by", nullable = false)
    private UUID teacherId;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    private Boolean active = true;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (active == null) active = true;
        if (legacyCode == null) legacyCode = code;
    }

    public AttendanceSession() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    public String getCode() { return code; }
    public void setCode(String code) { 
        this.code = code; 
        this.legacyCode = code;
    }
    public String getLegacyCode() { return legacyCode; }
    public void setLegacyCode(String legacyCode) { this.legacyCode = legacyCode; }
    public UUID getTeacherId() { return teacherId; }
    public void setTeacherId(UUID teacherId) { this.teacherId = teacherId; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
