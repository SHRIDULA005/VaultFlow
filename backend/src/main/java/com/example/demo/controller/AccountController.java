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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AccountDTO;
import com.example.demo.model.Account;
import com.example.demo.service.AccountService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    @Autowired
    AccountService ser;

    @GetMapping("{id}")
    public Account getaccountbyid(@PathVariable Long id){
        Optional<Account> ans=ser.getDataById(id);
        return ans.orElse(null);
    }

    @GetMapping
    public List<Account> getallaccount(){
        List<Account> ans=ser.getallaccount();
        return ans;
    }

    @PostMapping(/post")
    public String postAccount(@RequestBody Account account){
        String ans=ser.postData(account);
        return ans;
    }

    @PutMapping("{id}")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO){
        AccountDTO up=ser.updateAccount(id,accountDTO);
        return ResponseEntity.status(HttpStatus.OK).body(up);
    }

    @DeleteMapping("/{id}")
    public String deleteuser(@PathVariable Long id){
        Optional<Account> ans =ser.getDataById(id);
        if(ans.isPresent()){
            ser.deleteuserbyid(id);
            return "Account deleted";
        }
        else return "id not found";
    }
}
