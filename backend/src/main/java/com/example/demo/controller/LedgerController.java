package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Ledger;
import com.example.demo.service.LedgerService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
public class LedgerController {
    @Autowired
    LedgerService ser;

    @PostMapping("/post")
    public String postLedger(@RequestBody Ledger l){
        return ser.postledger(l);
    }

    @GetMapping("/getall")
    public List<Ledger> getallledger(){
        List<Ledger> ans= ser.getallledger();
        return ans;
    }

    @GetMapping("/get/{id}"
        
    )
}
