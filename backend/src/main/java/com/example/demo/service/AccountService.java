package com.example.demo.service;




import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.AccountDTO;
import com.example.demo.model.Account;
import com.example.demo.repository.AccountRepository;

@Service
public class AccountService {
    @Autowired
    AccountRepository repo;

    public string postData(Account account){
         repo.save(account);
         return "inserted succesfully";
    }

    public AccountDTO updateAccount(Long id,AccountDTO accountDTO){
        accountDTO.setId(id);
        return accountDTO;
    }
    
}
