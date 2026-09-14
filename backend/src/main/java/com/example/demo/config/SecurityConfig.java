package com.example.demo.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.security.JwtRequestFilter;
import com.example.demo.service.CustomUserDetailsService;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtRequestFilter jwtFilter;


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(
                customUserDetailsService
        );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }


    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }


    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http

                // =================================================
                // CORS
                // =================================================

                .cors(cors -> {})


                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf -> csrf.disable())


                // =================================================
                // STATELESS JWT SESSION
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth


                        // =========================================
                        // PUBLIC AUTHENTICATION ENDPOINTS
                        // =========================================

                        .requestMatchers(
                                "/auth/login",
                                "/auth/register",
                                "/auth/logout"
                        )
                        .permitAll()


                        // =========================================
                        // SWAGGER / OPENAPI
                        // =========================================

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        )
                        .permitAll()


                        // =========================================
                        // CORS PREFLIGHT REQUESTS
                        // =========================================

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // =====================================================
                        // LEDGER MANAGEMENT
                        // =====================================================

                        // -----------------------------------------
                        // VIEW LEDGERS
                        // -----------------------------------------
                        // Any authenticated user can view ledgers.
                        //
                        // GET /api/ledgers
                        // GET /api/ledgers/{id}
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ledgers",
                                "/api/ledgers/**"
                        )
                        .authenticated()


                        // -----------------------------------------
                        // CREATE LEDGER
                        // -----------------------------------------
                        // AUDITOR + ADMIN
                        //
                        // POST /api/ledgers
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/ledgers",
                                "/api/ledgers/**"
                        )
                        .hasAnyRole(
                                "AUDITOR",
                                "ADMIN"
                        )


                        // -----------------------------------------
                        // EDIT LEDGER
                        // -----------------------------------------
                        // AUDITOR + ADMIN
                        //
                        // PUT /api/ledgers/{id}
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/ledgers/**"
                        )
                        .hasAnyRole(
                                "AUDITOR",
                                "ADMIN"
                        )


                        // -----------------------------------------
                        // DELETE LEDGER
                        // -----------------------------------------
                        // AUDITOR + ADMIN
                        //
                        // DELETE /api/ledgers/{id}
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/ledgers/**"
                        )
                        .hasAnyRole(
                                "AUDITOR",
                                "ADMIN"
                        )


                        // =====================================================
                        // TRANSACTION MANAGEMENT
                        // =====================================================

                        // -----------------------------------------
                        // VIEW TRANSACTIONS
                        // -----------------------------------------
                        // Any authenticated user can view transactions.
                        //
                        // GET /api/transactions
                        // GET /api/transactions/{id}
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/transactions",
                                "/api/transactions/**"
                        )
                        .authenticated()


                        // -----------------------------------------
                        // CREATE TRANSACTION
                        // -----------------------------------------
                        // TREASURER + ADMIN
                        //
                        // POST /api/transactions
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/transactions",
                                "/api/transactions/**"
                        )
                        .hasAnyRole(
                                "TREASURER",
                                "ADMIN"
                        )


                        // -----------------------------------------
                        // EDIT / APPROVE TRANSACTION
                        // -----------------------------------------
                        // TREASURER + ADMIN
                        //
                        // PUT /api/transactions/{id}
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/transactions/**"
                        )
                        .hasAnyRole(
                                "TREASURER",
                                "ADMIN"
                        )


                        // -----------------------------------------
                        // DELETE / REVERSE TRANSACTION
                        // -----------------------------------------
                        // TREASURER + ADMIN
                        //
                        // DELETE /api/transactions/{id}
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/transactions/**"
                        )
                        .hasAnyRole(
                                "TREASURER",
                                "ADMIN"
                        )


                        // =====================================================
                        // ADMIN-ONLY DELETE ROUTES
                        // =====================================================

                        .requestMatchers(
                                "/delete/**"
                        )
                        .hasRole("ADMIN")


                        // =====================================================
                        // ALL OTHER ENDPOINTS
                        // =====================================================

                        .anyRequest()
                        .authenticated()
                )


                // =========================================================
                // AUTHENTICATION PROVIDER
                // =========================================================

                .authenticationProvider(
                        authenticationProvider()
                )


                // =========================================================
                // JWT FILTER
                // =========================================================

                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}