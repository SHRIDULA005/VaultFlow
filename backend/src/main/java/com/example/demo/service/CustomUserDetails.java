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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        String role = user.getRole();

        // No role -> no authorities
        if (role == null || role.isBlank()) {
            return List.of();
        }

        /*
         * Normalize database role.
         *
         * AUDITOR
         * auditor
         * Auditor
         * ROLE_AUDITOR
         * " AUDITOR "
         *
         * All become:
         *
         * ROLE_AUDITOR
         */

        role = role
                .trim()
                .toUpperCase()
                .replaceFirst("^ROLE_", "");


        /*
         * Prevent malformed authority such as:
         *
         * ROLE_
         */

        if (role.isBlank()) {
            return List.of();
        }


        String authority = "ROLE_" + role;


        return List.of(
                new SimpleGrantedAuthority(authority)
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