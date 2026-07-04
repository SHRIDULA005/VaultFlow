package com.example.demo.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AuditLog;
import com.example.demo.repository.AuditLogRepository;

@RestController
public class AuditController {
    @Autowired
    AuditLogRepository repo;

    @GetMapping("/getall")
    public Optional<AuditLog> getallaudit(){
        Optional<
    }
}
