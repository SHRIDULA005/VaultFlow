// package com.example.demo.controller;

// import java.util.List;
// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import com.example.demo.dto.TransactionDTO;
// import com.example.demo.model.Transaction;
// import com.example.demo.service.TransactionService;

// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/api/transactions")
// public class TransactionController {

//     @Autowired
//     private TransactionService transactionService;

//     // @PostMapping
//     // public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody TransactionDTO transactionDTO) {
//     //     TransactionDTO saved = transactionService.createTransaction(transactionDTO);
//     //     return ResponseEntity.status(HttpStatus.CREATED).body(saved);
//     // }
//     @PostMapping
//     @PreAuthorize("hasRole('TREASURER')")
//     public ResponseEntity<TransactionDTO> createTransaction(
//         @Valid @RequestBody TransactionDTO transactionDTO) {

//         TransactionDTO saved = transactionService.createTransaction(transactionDTO);
//         return ResponseEntity.status(HttpStatus.CREATED).body(saved);
//     }

//     @GetMapping
//     public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
//         return ResponseEntity.ok(transactionService.getAllTransactions());
//     }

//     @GetMapping("/{id}")
//     public Optional<Transaction> getTransactionById(@PathVariable Long id) {
//         return transactionService.getTransactionById(id);
//     }

//     // @DeleteMapping("/{id}")
//     // public ResponseEntity<String> reverseTransaction(@PathVariable Long id) {
//     //     transactionService.reverseTransaction(id);
//     //     return ResponseEntity.status(HttpStatus.OK).body("Transaction reverved successfully");
//     // }
//     @DeleteMapping("/{id}")
//     public ResponseEntity<String> reverseTransaction(@PathVariable Long id) {
//         transactionService.reverseTransaction(id);
//         return ResponseEntity.ok("Transaction reversed successfully.");
//     }
// }
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
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<TransactionDTO> createTransaction(
            @Valid @RequestBody TransactionDTO transactionDTO) {

        TransactionDTO saved =
                transactionService.createTransaction(
                        transactionDTO
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }


    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {

        return ResponseEntity.ok(
                transactionService.getAllTransactions()
        );
    }


    // =========================================================
    // GET TRANSACTIONS BY LEDGER
    // =========================================================

    @GetMapping("/ledger/{ledgerId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByLedger(
            @PathVariable String ledgerId) {

        return ResponseEntity.ok(
                transactionService.getTransactionsByLedger(
                        ledgerId
                )
        );
    }


    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Optional<Transaction> getTransactionById(
            @PathVariable Long id) {

        return transactionService.getTransactionById(id);
    }


    // =========================================================
    // UPDATE COMPLETE TRANSACTION
    // =========================================================
    //
    // IMPORTANT:
    // This updates:
    // 1. Amount
    // 2. Source Account
    // 3. Target Account
    // 4. Reference ID
    // 5. Status
    // 6. Ledger ID
    //
    // Before:
    // updateTransactionStatus(...)
    //
    // Now:
    // updateTransaction(...)
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TREASURER')")
    public ResponseEntity<TransactionDTO> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionDTO transactionDTO) {

        TransactionDTO updated =
                transactionService.updateTransaction(
                        id,
                        transactionDTO
                );

        return ResponseEntity.ok(updated);
    }


    // =========================================================
    // DELETE / REVERSE TRANSACTION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> reverseTransaction(
            @PathVariable Long id) {

        transactionService.reverseTransaction(id);

        return ResponseEntity.ok(
                "Transaction reversed successfully."
        );
    }
}