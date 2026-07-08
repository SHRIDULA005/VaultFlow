package com.example.demo.controller;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AuditLog;
import com.example.demo.service.AuditService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;


@RestController
@RequestMapping("/api/audit")
public class AuditController {
    @Autowired
    AuditService ser;

    @PostMapping
    public String postauditlog(@RequestBody AuditLog al){
        String ans=ser.postauditlog(al);
        return ans;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getallaudit(){
        List<AuditLog> ans= ser.getallaudit();
        return ResponseEntity.status(HttpStatus.OK).body(ans);
    }

    @GetMapping("/{id}")
    public Optional<AuditLog> getauditbyid(@PathVariable Long id){
        Optional<AuditLog> ans=getauditbyid(id);
        return ans;
    }

    
}
