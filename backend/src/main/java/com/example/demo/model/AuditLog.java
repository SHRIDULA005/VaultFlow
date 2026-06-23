package com.example.demo.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class AuditLog {
    @Id
    @Column
    private Long id;
    @Column
    private String action;
    @Column
    private Date timestamp; 
}
