package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {

    private Long id;

    private String accountName;

    private String accountType;

    private Double balance;

    private Double interestRate;

    private Long targetAccountId;

    private String status;
}