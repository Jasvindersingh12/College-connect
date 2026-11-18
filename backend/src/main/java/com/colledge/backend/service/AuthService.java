
package com.colledge.backend.service;

import com.colledge.backend.dto.AuthResponse;
import com.colledge.backend.dto.RegisterRequest;
import com.colledge.backend.dto.UserResponse;
import com.colledge.backend.entity.User;
import com.colledge.backend.entity.UserCredential;
import com.colledge.backend.repository.UserRepository;
import com.colledge.backend.repository.UserCredentialRepository;
import com.colledge.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserCredentialRepository credentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            UserCredentialRepository credentialRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.credentialRepository = credentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public User register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        String role = request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole().toUpperCase()
                : "USER";
        user.setRole(role);

        User savedUser = userRepository.save(user);

        UserCredential credential = new UserCredential();
        credential.setUserId(savedUser.getId());
        credential.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        credentialRepository.save(credential);

        return savedUser;
    }

    public AuthResponse login(String email, String password) {

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        UserCredential credential = credentialRepository.findById(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(password, credential.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(new UserResponse(user), token);
    }
}
