package com.example.demo.service;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.AccountDTO;
import com.example.demo.model.Account;
import com.example.demo.repository.AccountRepository;

@Service
public class AccountService {
    @Autowired
    AccountRepository repo;

    public AccountDTO updateAccount(Long id,AccountDTO acc){
        accountDTO.setId
    }
    
}
