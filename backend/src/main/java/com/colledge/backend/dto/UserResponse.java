package com.colledge.backend.dto;

import com.colledge.backend.entity.User;
import java.util.UUID;

public class UserResponse {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String department;
    private String course;
    private String semester;
    private String enrollmentNumber;

    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.department = user.getDepartment();
        this.course = user.getCourse();
        this.semester = user.getSemester();
        this.enrollmentNumber = user.getEnrollmentNumber();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
    public String getCourse() { return course; }
    public String getSemester() { return semester; }
    public String getEnrollmentNumber() { return enrollmentNumber; }
}
