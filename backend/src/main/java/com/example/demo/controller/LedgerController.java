package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.LedgerService;

@RestController
public class LedgerController {
    @Autowired
    LedgerService ser;
    
}
