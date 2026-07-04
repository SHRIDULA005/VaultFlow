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
    AuditLogRepository repo;

    public String postauditlog(AuditLog al){
        repo.save(al);
        return "AuditLog inserted";
    }

    public List<AuditLog> getallaudit(){
        return repo.findAll();
    }

    public Optional<AuditLog> getauditbyid(Long id){
        return repo.findById(id);
    }
}
