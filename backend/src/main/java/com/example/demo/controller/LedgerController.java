package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LedgerDTO;
import com.example.demo.model.Ledger;
import com.example.demo.service.LedgerService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/api/ledgers")
public class LedgerController {
    @Autowired
    LedgerService ser;

    @PostMapping
    public String postLedger(@RequestBody Ledger l){
        return ser.postledger(l);
    }

    @GetMapping
    public List<Ledger> getallledger(){
        List<Ledger> ans= ser.getallledger();
        return ans;
    }

    @GetMapping("/{id}")
    public Optional<Ledger> getledgerbyid(@PathVariable Long id){
        Optional<Ledger> ans = ser.getledgerbyid(id);
        return ans;  
    }

    @GetMapping
    public ResponseEntity<Page<LedgerDTO>> 
    
}
