package com.example.demo.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Ledger {
    @Id
    @Column
    private Long id;
    @Column
    private String description;
    @Column
    private Date createdAt;
    public Ledger() {
    }
    public Ledger(Long id, String description, Date createdAt) {
        this.id = id;
        this.description = description;
        this.createdAt = createdAt;
    }

    
}
