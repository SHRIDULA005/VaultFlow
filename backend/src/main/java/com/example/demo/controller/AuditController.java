package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.repository.AuditLogRepository;

@RestController
public class AuditController {
    @Autowired
    AuditLogRepository repo;

    @GetMapping("/get")
    public 
}
