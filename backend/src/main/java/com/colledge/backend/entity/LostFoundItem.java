package com.colledge.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "lost_found_items")
public class LostFoundItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // "Lost" or "Found"

    private String location;

    @Column(length = 1000)
    private String description;

    private String contact;

    @Column(name = "reported_by")
    private String reportedBy;

    @Column(name = "created_at")
    private Instant createdAt;

    private Boolean resolved = false;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (resolved == null) resolved = false;
        if (type == null) type = "Lost";
    }

    public LostFoundItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Boolean getResolved() { return resolved; }
    public void setResolved(Boolean resolved) { this.resolved = resolved; }
}
