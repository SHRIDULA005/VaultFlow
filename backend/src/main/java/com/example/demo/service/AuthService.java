package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.security.JwtUtil;


@Service
public class AuthService {


    @Autowired
    private AuthenticationManager authenticationManager;


    @Autowired
    private JwtUtil jwtService;


    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    public LoginResponse login(
            LoginRequest request) {


        /*
         * Authenticate email + password
         */

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );


        /*
         * Get authenticated user
         */

        UserDetails user =
                (UserDetails) authentication.getPrincipal();


        /*
         * Generate JWT
         */

        String token =
                jwtService.generateToken(user);


        /*
         * Get role
         *
         * ROLE_TREASURER
         *       ↓
         * TREASURER
         */

        String role =
                user.getAuthorities()
                        .stream()
                        .findFirst()
                        .map(authority ->
                                authority
                                    .getAuthority()
                                    .replaceFirst(
                                            "^ROLE_",
                                            ""
                                    )
                        )
                        .orElse(null);


        /*
         * Return token + role
         */

        return new LoginResponse(
                token,
                role
        );
    }
}