package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.model.Transaction;
import com.example.demo.service.TransactionService;


@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    @Autowired 
    TransactionService ser;

    @PostMapping
    public String createTransaction(@RequestBody Transaction data){
        String ans=ser.createTransaction(data);
        return ans;
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO transactionDTO) {
        TransactionDTO saved = ser.createTransaction(transactionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        List<TransactionDTO> transactions = ser.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/{id}")
        public ResponseEntity<String> deleteTransaction(@PathVariable("id") Long id) {
        ser.deleteTransaction(id);
        return new ResponseEntity<>("Transaction reversed successfully.", HttpStatus.OK);
    }
}
