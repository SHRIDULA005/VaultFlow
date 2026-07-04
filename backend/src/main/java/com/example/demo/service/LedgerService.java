package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Ledger;
import com.example.demo.repository.LedgerRepository;

@Service
public class LedgerService {
    @Autowired
    LedgerRepository repo;

    public String postledger(Ledger l){
        repo.save(l);
        return "Ledger added succesfully";
    }

    public List<Ledger> getallledger
}
