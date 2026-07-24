package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.AuditLog;
import com.example.demo.repository.AuditLogRepository;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository repo;

    
    public String postAuditLog(AuditLog auditLog) {
        repo.save(auditLog);
        return "AuditLog inserted";
    }

    
    public List<AuditLog> getAllAudit() {
        return repo.findAll();
    }

    
    public Optional<AuditLog> getAuditById(Long id) {
        return repo.findById(id);
    }

    
    public AuditLog updateAudit(Long id, AuditLog auditLog) {

        AuditLog existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit Log not found"));

        existing.setAction(auditLog.getAction());
        existing.setPerformedBy(auditLog.getPerformedBy());
        existing.setTimestamp(auditLog.getTimestamp());

        return repo.save(existing);
    }

    
    public void deleteAudit(Long id) {
        repo.deleteById(id);
    }
}