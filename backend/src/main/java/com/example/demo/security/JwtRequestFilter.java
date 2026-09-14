package com.example.demo.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class JwtRequestFilter
        extends OncePerRequestFilter {


    @Autowired
    private JwtUtil jwtUtil;


    @Autowired
    private CustomUserDetailsService customUserDetailsService;


    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {


        // =====================================================
        // REQUEST INFORMATION
        // =====================================================

        String path =
                request.getRequestURI();

        String method =
                request.getMethod();


        System.out.println(
                "JWT filter -> "
                        + method
                        + " "
                        + path
        );


        // =====================================================
        // AUTHORIZATION HEADER
        // =====================================================

        String authHeader =
                request.getHeader(
                        "Authorization"
                );


        if (
                authHeader == null ||
                authHeader.isBlank()
        ) {

            System.out.println(
                    "JWT filter -> No Authorization header"
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =====================================================
        // CHECK BEARER PREFIX
        // =====================================================

        if (
                !authHeader
                        .startsWith("Bearer ")
        ) {

            System.out.println(
                    "JWT filter -> Invalid Authorization format"
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =====================================================
        // EXTRACT TOKEN
        // =====================================================

        String token =
                authHeader
                        .substring(7)
                        .trim();


        if (token.isEmpty()) {

            System.out.println(
                    "JWT filter -> Empty JWT"
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        try {


            // =================================================
            // EXTRACT USERNAME
            // =================================================

            String email =
                    jwtUtil.extractUsername(
                            token
                    );


            System.out.println(
                    "JWT filter -> username: "
                            + email
            );


            if (
                    email == null ||
                    email.isBlank()
            ) {

                System.out.println(
                        "JWT filter -> Username missing from JWT"
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // DON'T OVERWRITE EXISTING AUTHENTICATION
            // =================================================

            Authentication existing =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();


            if (
                    existing != null &&
                    existing.isAuthenticated()
            ) {

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // LOAD USER
            // =================================================

            UserDetails userDetails =
                    customUserDetailsService
                            .loadUserByUsername(
                                    email
                            );


            System.out.println(
                    "JWT filter -> DB user loaded: "
                            + userDetails.getUsername()
            );


            System.out.println(
                    "JWT filter -> authorities: "
                            + userDetails.getAuthorities()
            );


            // =================================================
            // VALIDATE TOKEN
            // =================================================

            boolean valid =
                    jwtUtil.validateToken(
                            token,
                            userDetails
                    );


            if (!valid) {

                System.out.println(
                        "JWT filter -> INVALID TOKEN"
                );

                SecurityContextHolder
                        .clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =================================================
            // CREATE SPRING AUTHENTICATION
            // =================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );


            // =================================================
            // REQUEST DETAILS
            // =================================================

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );


            // =================================================
            // SAVE AUTHENTICATION
            // =================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


            System.out.println(
                    "JWT filter -> AUTHENTICATED"
            );

            System.out.println(
                    "JWT filter -> USER: "
                            + email
            );

            System.out.println(
                    "JWT filter -> AUTHORITIES: "
                            + userDetails
                                    .getAuthorities()
            );


        } catch (Exception exception) {


            System.out.println(
                    "JWT filter -> ERROR: "
                            + exception.getClass()
                                    .getSimpleName()
            );

            System.out.println(
                    "JWT filter -> MESSAGE: "
                            + exception.getMessage()
            );


            SecurityContextHolder
                    .clearContext();
        }


        // =====================================================
        // CONTINUE REQUEST
        // =====================================================

        filterChain.doFilter(
                request,
                response
        );
    }
}