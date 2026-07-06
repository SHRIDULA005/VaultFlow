package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.TransactionRepository;

@Service
public class TransactionService {
    @Autowired
    TransactionRepository repo;

    public String posttransaction(data){
        repo.save(data);
        return "inserted succesfully"
    }
}
