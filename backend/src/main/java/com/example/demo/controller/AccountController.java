package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.AccountService;

@RestController
public class AccountController {
    @Autowired
    AccountService ser;

    @PutMapping("/update")
}
