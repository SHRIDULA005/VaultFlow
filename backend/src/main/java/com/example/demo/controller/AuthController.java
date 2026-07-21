package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 

import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
     AuthService authService;
    // @PostMapping("/login")
    // public ResponseEntity<String> login(@RequestBody LoginRequest request,HttpServletRequest req){
    //     return ResponseEntity.ok(authService.login(request,req));
    // }
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        System.out.println("Inside Login Controller");
        return ResponseEntity.ok("Login endpoint reached");
    }
    
}

 

 
