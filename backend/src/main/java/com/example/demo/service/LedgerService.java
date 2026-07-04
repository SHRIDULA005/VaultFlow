package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.LedgerRepository;

@Service
public class LedgerService {
    @Autowired
    LedgerRepository repo;

    public String postledger(Long id){
        repo.save
    }
}
