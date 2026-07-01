package com.example.demo.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AccountDTO;
import com.example.demo.model.Account;
import com.example.demo.service.AccountService;

@RestController
public class AccountController {
    @Autowired
    AccountService ser;

    @PostMapping("/post")
    public String postAccount(@RequestBody Account account){
        String ans=ser.postData(account);
        return ans;
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO){
        AccountDTO up=ser.updateAccount(id,accountDTO);
        return ResponseEntity.status(HttpStatus.OK).body(up);
    }
}
