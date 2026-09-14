package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    /*
     * =========================================================
     * LOGIN
     * POST /auth/login
     * =========================================================
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }


    /*
     * =========================================================
     * REGISTER
     * POST /auth/register
     * =========================================================
     */
    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody User user) {

        return ResponseEntity.ok(
                userService.registerUser(user)
        );
    }


    /*
     * =========================================================
     * LOGOUT
     * POST /auth/logout
     * =========================================================
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {

        return ResponseEntity.ok(
                "Logout successful"
        );
    }
}