package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.model.Transaction;
import com.example.demo.repository.TransactionRepository;

@Service
public class TransactionService {
    @Autowired
    TransactionRepository repo;

    public String posttransaction(Transaction data){
        repo.save(data);
        return "inserted succesfully";
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
    TransactionDTO dto = new TransactionDTO();

    dto.setId(transaction.getId());
    dto.setAmount(transaction.getAmount());
    dto.setReferenceId(transaction.getReferenceId());

    dto.setSourceAccountId(transaction.getSourceAccount().getId());
    dto.setTargetAccountId(transaction.getTargetAccount().getId());

    dto.setStatus(transaction.getStatus());

    return dto;
    }

    public List<TransactionDTO> getAllTransactions() {
    List<Transaction> transactions = repo.findAll();

    return transactions.stream()
            .map(this::convertToDTO)
            .toList();
    }

    public void deleteTransaction(Long id) {
        repo.deleteById(id);
    }
}
