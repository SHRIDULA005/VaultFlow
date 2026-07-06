package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.model.Transaction;
import com.example.demo.service.TransactionService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
public class TransactionController {
    @Autowired 
    TransactionService ser;

    @PostMapping("/post")
    public String posttracsaction(@RequestBody Transaction data){
        String ans=ser.posttransaction(data);
        return ans;
    }

    @GetMapping("/gettransactions")
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        List<TransactionDTO> transactions = ser.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/api/transactions/{id}")
    public ResponseEntity<String> deletetransaction(@PathVariable Long id){
        Optional<Transaction> ite= ser.deletetransaction(id);
    }
}
