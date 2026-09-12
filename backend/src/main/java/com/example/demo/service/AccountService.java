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

    // Get account by ID
    public Optional<Account> getDataById(Long id) {
        Optional<Account> ans = repo.findById(id);
        return ans;
    }

    // Get all accounts
    public List<Account> getallaccount() {
        return repo.findAll();
    }

    // Create account
    public String postData(Account account) {
        repo.save(account);
        return "inserted succesfully";
    }

    // Update account
    public AccountDTO updateAccount(Long id, AccountDTO accountDTO) {

        Optional<Account> existingAccount = repo.findById(id);

        if (existingAccount.isPresent()) {

            Account account = existingAccount.get();

            // ---------------------------------
            // Update Account Name
            // ---------------------------------
            if (accountDTO.getAccountName() != null) {
                account.setAccountName(
                        accountDTO.getAccountName()
                );
            }

            // ---------------------------------
            // Update Account Type
            // ---------------------------------
            if (accountDTO.getAccountType() != null) {

                account.setAccountType(
                        accounttype.valueOf(
                                accountDTO
                                        .getAccountType()
                                        .toUpperCase()
                        )
                );
            }

            // ---------------------------------
            // Update Balance
            // ---------------------------------
            if (accountDTO.getBalance() != null) {
                account.setBalance(
                        accountDTO.getBalance()
                );
            }

            // ---------------------------------
            // Update Interest Rate
            // ---------------------------------
            if (accountDTO.getInterestRate() != null) {
                account.setInterestRate(
                        accountDTO.getInterestRate()
                );
            }

            // ---------------------------------
            // Save changes to database
            // ---------------------------------
            repo.save(account);

            // ---------------------------------
            // Return updated DTO
            // ---------------------------------
            accountDTO.setId(id);

            return accountDTO;
        }

        // Account not found
        return null;
    }

    // Delete account
    public void deleteuserbyid(Long id) {
        repo.deleteById(id);
    }
}