package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;

@Entity
public class Account {
    @Id
    @Column(name="id")
    private Long id;
    @Column(nullable = false)
    private String accountName;
    @Column
    @Enumerated(EnumType.STRING)
    private accounttype accountType;
    @Column
    private Double balance;
    @Column
    private Double interestRate;
    
    public Account() {
    }

    public Account(Long id, String accountName, accounttype accountType, Double balance, Double interestRate) {
        this.id = id;
        this.accountName = accountName;
        this.accountType = accountType;
        this.balance = balance;
        this.interestRate = interestRate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public accounttype getAccountType() {
        return accountType;
    }

    public void setAccountType(accounttype accountType) {
        this.accountType = accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    
}
