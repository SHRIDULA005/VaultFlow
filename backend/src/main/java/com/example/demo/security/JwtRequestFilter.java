package com.example.demo.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
public class JwtRequestFilter extends OncePerRequestFilter {


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


        /*
         * =====================================================
         * GET AUTHORIZATION HEADER
         * =====================================================
         */

        String authHeader =
                request.getHeader("Authorization");


        /*
         * No JWT supplied.
         *
         * Continue normally.
         */

        if (
                authHeader == null ||
                !authHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        /*
         * =====================================================
         * EXTRACT TOKEN
         * =====================================================
         */

        String token =
                authHeader.substring(7).trim();


        /*
         * Empty token
         */

        if (token.isEmpty()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        try {

            /*
             * =================================================
             * EXTRACT USER EMAIL
             * =================================================
             */

            String email =
                    jwtUtil.extractUsername(token);


            if (
                    email != null &&
                    !email.isBlank() &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null
            ) {


                /*
                 * =============================================
                 * LOAD USER FROM DATABASE
                 * =============================================
                 */

                UserDetails userDetails =
                        customUserDetailsService
                                .loadUserByUsername(email);


                /*
                 * =============================================
                 * VALIDATE TOKEN
                 * =============================================
                 */

                boolean valid =
                        jwtUtil.validateToken(
                                token,
                                userDetails
                        );


                if (valid) {


                    /*
                     * =========================================
                     * GET USER AUTHORITIES
                     * =========================================
                     */

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );


                    /*
                     * Attach request details.
                     */

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );


                    /*
                     * =========================================
                     * SET SECURITY CONTEXT
                     * =========================================
                     */

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );


                    /*
                     * Useful backend debugging.
                     *
                     * Example:
                     *
                     * JWT User:
                     * treasurer@vaultflow.io
                     *
                     * Authorities:
                     * [ROLE_TREASURER]
                     */

                    System.out.println(
                            "JWT authenticated user: "
                                    + email
                    );

                    System.out.println(
                            "JWT authorities: "
                                    + userDetails
                                            .getAuthorities()
                    );

                } else {

                    /*
                     * Token failed validation.
                     */

                    System.out.println(
                            "JWT validation failed for user: "
                                    + email
                    );
                }
            }


        } catch (Exception e) {

            /*
             * Do not crash the request.
             *
             * Clear any partially created authentication.
             */

            SecurityContextHolder
                    .clearContext();


            System.out.println(
                    "JWT authentication failed: "
                            + e.getMessage()
            );
        }


        /*
         * Continue request chain.
         */

        filterChain.doFilter(
                request,
                response
        );
    }
}