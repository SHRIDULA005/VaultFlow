package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.AccountDTO;
import com.example.demo.model.Account;
import com.example.demo.model.accounttype;
import com.example.demo.repository.AccountRepository;

@Service
public class AccountService {

    @Autowired
    AccountRepository repo;

    public Optional<Account> getDataById(Long id) {
        Optional<Account> ans = repo.findById(id);
        return ans;
    }

    public List<Account> getallaccount() {
        return repo.findAll();
    }

    public String postData(Account account) {
        repo.save(account);
        return "inserted succesfully";
    }

    public AccountDTO updateAccount(Long id, AccountDTO accountDTO) {

        Optional<Account> existingAccount =
                repo.findById(id);

        if (existingAccount.isPresent()) {

            Account account = existingAccount.get();

            // Update account name
            account.setAccountName(
                    accountDTO.getAccountName()
            );

            // Update account type
            if (accountDTO.getAccountType() != null) {
                account.setAccountType(
                        accounttype.valueOf(
                                accountDTO
                                        .getAccountType()
                                        .toUpperCase()
                        )
                );
            }

            // Update balance
            account.setBalance(
                    accountDTO.getBalance()
            );

            // Update interest rate
            account.setInterestRate(
                    accountDTO.getInterestRate()
            );

            // Save changes to database
            repo.save(account);

            // Return updated DTO
            accountDTO.setId(id);

            return accountDTO;
        }

        return null;
    }

    public void deleteuserbyid(Long id) {
        repo.deleteById(id);
    }
}