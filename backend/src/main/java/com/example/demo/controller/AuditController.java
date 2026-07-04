package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AuditLog;
import com.example.demo.service.AuditService;


@RestController
public class AuditController {
    @Autowired
    AuditService ser;

    @

    @GetMapping("getall")
    public List<AuditLog> getallaudit(){
        List<AuditLog> ans= ser.getallaudit();
        return ans;
    }
}
