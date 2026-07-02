// package com.example.demo.model;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.Id;
// import jakarta.validation.constraints.Email;

// @Entity
// public class User {
//     @Id
//     @Column
//     private Long id;
//     @Email
//     @Column(unique=true,nullable=false)
//     private String email;
//     @Column(nullable=false)
//     private String password;
//     @Column(nullable = false)
//     private String role;
//     @Column
//     private String userId;
//     @Column
//     private String organizationId;
//     public User() {
//     }
//     public User(Long id, @Email String email, String password, String role, String userId, String organizationId) {
//         this.id = id;
//         this.email = email;
//         this.password = password;
//         this.role = role;
//         this.userId = userId;
//         this.organizationId = organizationId;
//     }
//     public Long getId() {
//         return id;
//     }
//     public void setId(Long id) {
//         this.id = id;
//     }
//     public String getEmail() {
//         return email;
//     }
//     public void setEmail(String email) {
//         this.email = email;
//     }
//     public String getPassword() {
//         return password;
//     }
//     public void setPassword(String password) {
//         this.password = password;
//     }
//     public String getRole() {
//         return role;
//     }
//     public void setRole(String role) {
//         this.role = role;
//     }
//     public String getUserId() {
//         return userId;
//     }
//     public void setUserId(String userId) {
//         this.userId = userId;
//     }
//     public String getOrganizationId() {
//         return organizationId;
//     }
//     public void setOrganizationId(String organizationId) {
//         this.organizationId = organizationId;
//     }
    
    
// }
