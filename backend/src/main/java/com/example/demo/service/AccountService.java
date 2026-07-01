package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.AccountDTO;
import com.example.demo.repository.AccountRepository;

@Service
public class AccountService {
    @Autowired
    AccountRepository repo;

    private Account updateAccount(Long id,AccountDTO acc){
        return repo.findById
    }
    
}
