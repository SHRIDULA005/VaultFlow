package com.example.App.controller;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import com.example.App.Dto.LoginRequest;
import com.example.App.Dto.LoginResponse;
import com.example.App.service.AuthService;

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
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
        // return ResponseEntity.ok(new LoginResponse(token));
    }
 
}