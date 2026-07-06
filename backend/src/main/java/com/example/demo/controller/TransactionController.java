package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Transaction;
import com.example.demo.service.TransactionService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
public class TransactionController {
    @Autowired 
    TransactionService ser;

    @PostMapping("/post")
    public String posttracsaction(@RequestBody Transaction data){
        ser.podttransaction(data);
        
    }
}
