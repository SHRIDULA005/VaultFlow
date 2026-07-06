package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Transaction;
import com.example.demo.repository.TransactionRepository;

@Service
public class TransactionService {
    @Autowired
    TransactionRepository repo;

    public String posttransaction(Transaction data){
        repo.save(data);
        return "inserted succesfully";
    }

    public List<TransactionDTO> getAllTransactions(){
        return repo.findAll();
    }
}
