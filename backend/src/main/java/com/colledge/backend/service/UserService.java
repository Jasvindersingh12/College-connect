package com.colledge.backend.service;

import com.colledge.backend.dto.UserProfileUpdateRequest;
import com.colledge.backend.entity.User;
import com.colledge.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    // Get user by email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Update profile
    public User updateProfile(UUID id, UserProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getCourse() != null) {
            user.setCourse(request.getCourse());
        }
        if (request.getSemester() != null) {
            user.setSemester(request.getSemester());
        }
        if (request.getEnrollmentNumber() != null) {
            user.setEnrollmentNumber(request.getEnrollmentNumber());
        }
        return userRepository.save(user);
    }

    // Save user
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }
}
