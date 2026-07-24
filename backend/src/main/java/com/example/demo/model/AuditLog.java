package com.example.demo.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tbl_audit_logs")
public class AuditLog {
    @Id
    @Column
    private Long id;
    @Column(nullable=false)
    private String action;
    @Column
    private Date timestamp;
    @Column
    private String peformedBy;
    public AuditLog() {
    }
    public AuditLog(Long id, String action, Date timestamp, String peformedBy) {
        this.id = id;
        this.action = action;
        this.timestamp = timestamp;
        this.peformedBy = peformedBy;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getAction() {
        return action;
    }
    public void setAction(String action) {
        this.action = action;
    }
    public Date getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }
    public String getPeformedBy() {
        return peformedBy;
    }
    public void setPeformedBy(String peformedBy) {
        this.peformedBy = peformedBy;
    }

}
