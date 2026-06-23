package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;

@Entity
public class User {
    @Id
    @Column
    private Long id;
    @Email
    @Column(unique=true,nullable=false)
    private String email;
    @Column(nullable=false)
    private String password;
    @Column(nullable = false)
    private String role;
    @Column
    private String userId;
    @Columnprivate String organizationId


}
