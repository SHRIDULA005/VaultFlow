package com.example.demo.service;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.demo.model.User;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }


    // =========================================================
    // USERNAME
    // =========================================================

    @Override
    public String getUsername() {
        return user.getEmail();
    }


    // =========================================================
    // PASSWORD
    // =========================================================

    @Override
    public String getPassword() {
        return user.getPassword();
    }


    // =========================================================
    // AUTHORITIES
    // =========================================================
    //
    // IMPORTANT:
    //
    // Database values may be:
    //
    // TREASURER
    // treasurer
    // Treasurer
    // ROLE_TREASURER
    // " TREASURER "
    //
    // Spring Security expects:
    //
    // ROLE_TREASURER
    //
    // So we normalize the role before creating the authority.
    // =========================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        String role = user.getRole();

        if (role == null || role.isBlank()) {

            /*
             * No valid role.
             */
            return List.of();
        }


        /*
         * Normalize role.
         *
         * " treasurer "
         *       ↓
         * "TREASURER"
         *
         * "ROLE_TREASURER"
         *       ↓
         * "TREASURER"
         */

        role = role
                .trim()
                .toUpperCase()
                .replaceFirst("^ROLE_", "");


        /*
         * Build Spring Security authority.
         *
         * TREASURER
         *      ↓
         * ROLE_TREASURER
         */

        String authority =
                "ROLE_" + role;


        return List.of(
                new SimpleGrantedAuthority(
                        authority
                )
        );
    }


    // =========================================================
    // ACCOUNT STATUS
    // =========================================================

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }


    @Override
    public boolean isAccountNonLocked() {
        return true;
    }


    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @Override
    public boolean isEnabled() {
        return true;
    }
}