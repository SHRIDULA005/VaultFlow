package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.model.Transaction;
import com.example.demo.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;


    // =========================================================
    // CREATE TRANSACTION
    // TREASURER + ADMIN
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<TransactionDTO> createTransaction(
            @Valid @RequestBody TransactionDTO transactionDTO) {

        TransactionDTO saved =
                transactionService.createTransaction(transactionDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }


    // =========================================================
    // GET ALL TRANSACTIONS
    // AUTHENTICATED USERS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {

        return ResponseEntity.ok(
                transactionService.getAllTransactions()
        );
    }


    // =========================================================
    // GET TRANSACTIONS BY LEDGER
    // AUTHENTICATED USERS
    // =========================================================

    @GetMapping("/ledger/{ledgerId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByLedger(
            @PathVariable String ledgerId) {

        return ResponseEntity.ok(
                transactionService.getTransactionsByLedger(ledgerId)
        );
    }


    // =========================================================
    // GET TRANSACTION BY ID
    // AUTHENTICATED USERS
    // =========================================================

    @GetMapping("/{id}")
    public Optional<Transaction> getTransactionById(
            @PathVariable Long id) {

        return transactionService.getTransactionById(id);
    }


    // =========================================================
    // UPDATE / APPROVE TRANSACTION
    // TREASURER + ADMIN
    // =========================================================
    //
    // If the request contains ONLY "status", this is treated
    // as an approval/status update.
    //
    // Otherwise, it performs a complete transaction update.
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionDTO transactionDTO) {

        /*
         * APPROVAL / STATUS-ONLY UPDATE
         *
         * TransactionApproval.jsx sends:
         *
         * {
         *     "status": "APPROVED"
         * }
         *
         * Therefore handle status-only requests separately.
         */
        if (transactionDTO.getAmount() == null
                && transactionDTO.getSourceAccountId() == null
                && transactionDTO.getTargetAccountId() == null
                && transactionDTO.getReferenceId() == null
                && transactionDTO.getLedgerId() == null
                && transactionDTO.getStatus() != null) {

            TransactionDTO updated =
                    transactionService.updateTransactionStatus(
                            id,
                            transactionDTO.getStatus()
                    );

            return ResponseEntity.ok(updated);
        }


        /*
         * COMPLETE TRANSACTION UPDATE
         *
         * Used by the Edit Transaction screen.
         */
        TransactionDTO updated =
                transactionService.updateTransaction(
                        id,
                        transactionDTO
                );

        return ResponseEntity.ok(updated);
    }


    // =========================================================
    // DELETE / REVERSE TRANSACTION
    // TREASURER + ADMIN
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<String> reverseTransaction(
            @PathVariable Long id) {

        transactionService.reverseTransaction(id);

        return ResponseEntity.ok(
                "Transaction reversed successfully."
        );
    }
}