package com.example.demo.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
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

    @PutMapping("/update/{id}")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO){
        AccountDTO up=ser.updateAccount(id,accountDTO);
        return ResponseEntity.status(HttpStatusCode.OK);
    }
}
