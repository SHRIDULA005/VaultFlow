package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Ledger;
import com.example.demo.service.LedgerService;

@RestController
public class LedgerController {
    @Autowired
    LedgerService ser;

    @PostMapping("/post")
    public String postLedger(Ledger l){
        return ser.postledger(l);
    }

    @GetMapping("/getall")
    public List<Led
}
