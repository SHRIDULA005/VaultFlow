package com.example.demo.controller;

import java.lang.StackWalker.Option;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.AuditLog;
import com.example.demo.service.AuditService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;


@RestController
public class AuditController {
    @Autowired
    AuditService ser;

    @PostMapping("/post")
    public String postauditlog(@RequestBody AuditLog al){
        String ans=ser.postauditlog(al);
        return ans;
    }

    @GetMapping("getall")
    public List<AuditLog> getallaudit(){
        List<AuditLog> ans= ser.getallaudit();
        return ans;
    }

    @GetMapping("/get/{id}")
    public Optional<AuditLog> getauditbyid(@PathVariable Long id){
        Optional<AuditLog> ans=getauditbyid(id);
        ifreturn ans.orElse(null);
    }
}
