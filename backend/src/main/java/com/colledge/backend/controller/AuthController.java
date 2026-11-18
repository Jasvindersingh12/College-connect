
package com.colledge.backend.controller;
import com.colledge.backend.dto.AuthResponse;
import com.colledge.backend.dto.RegisterRequest;
import com.colledge.backend.entity.User;
import com.colledge.backend.service.AuthService;
import com.colledge.backend.dto.UserResponse;
import jakarta.validation.Valid;
import com.colledge.backend.dto.LoginRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserResponse(user));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(
                        request.getEmail(),
                        request.getPassword()
                )
        );
    }
}
