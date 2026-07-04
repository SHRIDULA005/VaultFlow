package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.AuditLogRepository;

@Service
public class AuditService {
    @Autowired
    AuditLogRepository repo;

    public Optional<Audit
}
