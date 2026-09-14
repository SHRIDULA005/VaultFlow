// package com.example.demo.service;

// import java.util.List;
// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.stereotype.Service;

// import com.example.demo.dto.TransactionDTO;
// import com.example.demo.model.Account;
// import com.example.demo.model.Transaction;
// import com.example.demo.repository.AccountRepository;
// import com.example.demo.repository.TransactionRepository;

// @Service
// public class TransactionService {

//     @Autowired
//     private TransactionRepository repo;

//     @Autowired
//     private AccountRepository accountRepo;

//     /*
//      * AUDITOR and TREASURER are allowed to create transactions.
//      */
//     @PreAuthorize("hasAnyRole('AUDITOR', 'TREASURER')")
//     public TransactionDTO createTransaction(TransactionDTO dto) {

//         Transaction transaction = new Transaction();

//         transaction.setAmount(dto.getAmount());
//         transaction.setReferenceId(dto.getReferenceId());
//         transaction.setStatus(dto.getStatus());
//         transaction.setLedgerId(dto.getLedgerId());

//         Account source =
//                 accountRepo
//                         .findById(dto.getSourceAccountId())
//                         .orElseThrow();

//         Account target =
//                 accountRepo
//                         .findById(dto.getTargetAccountId())
//                         .orElseThrow();

//         transaction.setSourceAccount(source);
//         transaction.setTargetAccount(target);

//         Transaction saved = repo.save(transaction);

//         return convertToDTO(saved);
//     }

//     private TransactionDTO convertToDTO(
//             Transaction transaction) {

//         TransactionDTO dto = new TransactionDTO();

//         dto.setId(transaction.getId());
//         dto.setAmount(transaction.getAmount());
//         dto.setReferenceId(
//                 transaction.getReferenceId()
//         );

//         dto.setLedgerId(
//                 transaction.getLedgerId()
//         );

//         if (transaction.getSourceAccount() != null) {
//             dto.setSourceAccountId(
//                     transaction
//                             .getSourceAccount()
//                             .getId()
//             );
//         }

//         if (transaction.getTargetAccount() != null) {
//             dto.setTargetAccountId(
//                     transaction
//                             .getTargetAccount()
//                             .getId()
//             );
//         }

//         dto.setStatus(transaction.getStatus());

//         return dto;
//     }

//     public List<TransactionDTO> getAllTransactions() {

//         return repo.findAll()
//                 .stream()
//                 .map(this::convertToDTO)
//                 .toList();
//     }

//     public List<TransactionDTO> getTransactionsByLedger(
//             String ledgerId) {

//         return repo.findByLedgerId(ledgerId)
//                 .stream()
//                 .map(this::convertToDTO)
//                 .toList();
//     }

//     public Optional<Transaction> getTransactionById(
//             Long id) {

//         return repo.findById(id);
//     }

//     @PreAuthorize("hasRole('TREASURER')")
//     public TransactionDTO updateTransactionStatus(
//             Long id,
//             String status) {

//         Transaction transaction =
//                 repo.findById(id)
//                         .orElseThrow(
//                                 () -> new RuntimeException(
//                                         "Transaction not found"
//                                 )
//                         );

//         if (status == null || status.isBlank()) {
//             throw new IllegalArgumentException(
//                     "Transaction status is required"
//             );
//         }

//         transaction.setStatus(
//                 status.toUpperCase()
//         );

//         Transaction updated =
//                 repo.save(transaction);

//         return convertToDTO(updated);
//     }

//     public void reverseTransaction(Long id) {

//         repo.deleteById(id);
//     }
// }
package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.model.Account;
import com.example.demo.model.Transaction;
import com.example.demo.repository.AccountRepository;
import com.example.demo.repository.TransactionRepository;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository repo;

    @Autowired
    private AccountRepository accountRepo;


    // =========================================================
    // CREATE TRANSACTION
    // =========================================================

    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public TransactionDTO createTransaction(
            TransactionDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Transaction data is required"
            );
        }


        // -----------------------------------------------------
        // AMOUNT VALIDATION
        // -----------------------------------------------------

        if (dto.getAmount() == null ||
                dto.getAmount() <= 0) {

            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero"
            );
        }


        // -----------------------------------------------------
        // REFERENCE VALIDATION
        // -----------------------------------------------------

        if (dto.getReferenceId() == null ||
                dto.getReferenceId().isBlank()) {

            throw new IllegalArgumentException(
                    "Transaction reference ID is required"
            );
        }


        // -----------------------------------------------------
        // SOURCE ACCOUNT VALIDATION
        // -----------------------------------------------------

        if (dto.getSourceAccountId() == null) {

            throw new IllegalArgumentException(
                    "Source account is required"
            );
        }


        // -----------------------------------------------------
        // TARGET ACCOUNT VALIDATION
        // -----------------------------------------------------

        if (dto.getTargetAccountId() == null) {

            throw new IllegalArgumentException(
                    "Target account is required"
            );
        }


        // -----------------------------------------------------
        // SAME ACCOUNT VALIDATION
        // -----------------------------------------------------

        if (dto.getSourceAccountId()
                .equals(dto.getTargetAccountId())) {

            throw new IllegalArgumentException(
                    "Source and destination accounts cannot be the same"
            );
        }


        // -----------------------------------------------------
        // CREATE ENTITY
        // -----------------------------------------------------

        Transaction transaction =
                new Transaction();


        transaction.setAmount(
                dto.getAmount()
        );


        transaction.setReferenceId(
                dto.getReferenceId()
        );


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (dto.getStatus() == null ||
                dto.getStatus().isBlank()) {

            transaction.setStatus(
                    "PENDING"
            );

        } else {

            transaction.setStatus(
                    dto.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }


        // -----------------------------------------------------
        // LEDGER
        // -----------------------------------------------------

        transaction.setLedgerId(
                normalizeLedgerId(
                        dto.getLedgerId()
                )
        );


        // -----------------------------------------------------
        // SOURCE ACCOUNT
        // -----------------------------------------------------

        Account source =
                accountRepo
                        .findById(
                                dto.getSourceAccountId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Source account not found: "
                                                + dto.getSourceAccountId()
                                )
                        );


        // -----------------------------------------------------
        // TARGET ACCOUNT
        // -----------------------------------------------------

        Account target =
                accountRepo
                        .findById(
                                dto.getTargetAccountId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Destination account not found: "
                                                + dto.getTargetAccountId()
                                )
                        );


        transaction.setSourceAccount(
                source
        );

        transaction.setTargetAccount(
                target
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Transaction saved =
                repo.save(transaction);


        return convertToDTO(saved);
    }


    // =========================================================
    // UPDATE COMPLETE TRANSACTION
    // =========================================================
    //
    // THIS IS THE MAIN FIX.
    //
    // The old method only changed status.
    //
    // This method updates ALL editable fields.
    // =========================================================

    @PreAuthorize("hasRole('TREASURER')")
    public TransactionDTO updateTransaction(
            Long id,
            TransactionDTO dto) {


        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

        if (dto == null) {

            throw new IllegalArgumentException(
                    "Transaction data is required"
            );
        }


        // -----------------------------------------------------
        // FIND EXISTING TRANSACTION
        // -----------------------------------------------------

        Transaction transaction =
                repo.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Transaction not found"
                                )
                        );


        // -----------------------------------------------------
        // AMOUNT
        // -----------------------------------------------------

        if (dto.getAmount() == null ||
                dto.getAmount() <= 0) {

            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero"
            );
        }

        transaction.setAmount(
                dto.getAmount()
        );


        // -----------------------------------------------------
        // REFERENCE ID
        // -----------------------------------------------------

        if (dto.getReferenceId() == null ||
                dto.getReferenceId().isBlank()) {

            throw new IllegalArgumentException(
                    "Transaction reference ID is required"
            );
        }

        transaction.setReferenceId(
                dto.getReferenceId().trim()
        );


        // -----------------------------------------------------
        // SOURCE ACCOUNT
        // -----------------------------------------------------

        if (dto.getSourceAccountId() == null) {

            throw new IllegalArgumentException(
                    "Source account is required"
            );
        }


        // -----------------------------------------------------
        // TARGET ACCOUNT
        // -----------------------------------------------------

        if (dto.getTargetAccountId() == null) {

            throw new IllegalArgumentException(
                    "Destination account is required"
            );
        }


        // -----------------------------------------------------
        // SAME SOURCE/TARGET CHECK
        // -----------------------------------------------------

        if (dto.getSourceAccountId()
                .equals(dto.getTargetAccountId())) {

            throw new IllegalArgumentException(
                    "Source and destination accounts cannot be the same"
            );
        }


        // -----------------------------------------------------
        // FIND SOURCE ACCOUNT
        // -----------------------------------------------------

        Account source =
                accountRepo
                        .findById(
                                dto.getSourceAccountId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Source account not found: "
                                                + dto.getSourceAccountId()
                                )
                        );


        // -----------------------------------------------------
        // FIND TARGET ACCOUNT
        // -----------------------------------------------------

        Account target =
                accountRepo
                        .findById(
                                dto.getTargetAccountId()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Destination account not found: "
                                                + dto.getTargetAccountId()
                                )
                        );


        // -----------------------------------------------------
        // UPDATE ACCOUNT RELATIONSHIPS
        // -----------------------------------------------------

        transaction.setSourceAccount(
                source
        );

        transaction.setTargetAccount(
                target
        );


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (dto.getStatus() == null ||
                dto.getStatus().isBlank()) {

            throw new IllegalArgumentException(
                    "Transaction status is required"
            );
        }

        transaction.setStatus(
                dto.getStatus()
                        .trim()
                        .toUpperCase()
        );


        // -----------------------------------------------------
        // LEDGER ID
        // -----------------------------------------------------

        transaction.setLedgerId(
                normalizeLedgerId(
                        dto.getLedgerId()
                )
        );


        // -----------------------------------------------------
        // SAVE UPDATED TRANSACTION
        // -----------------------------------------------------

        Transaction updated =
                repo.save(transaction);


        // -----------------------------------------------------
        // RETURN COMPLETE DTO
        // -----------------------------------------------------

        return convertToDTO(updated);
    }


    // =========================================================
    // OLD STATUS-ONLY METHOD
    // =========================================================
    //
    // Kept here so any existing code that already uses this
    // method does not suddenly break.
    // =========================================================

    @PreAuthorize("hasRole('TREASURER')")
    public TransactionDTO updateTransactionStatus(
            Long id,
            String status) {

        Transaction transaction =
                repo.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Transaction not found"
                                )
                        );


        if (status == null ||
                status.isBlank()) {

            throw new IllegalArgumentException(
                    "Transaction status is required"
            );
        }


        transaction.setStatus(
                status.trim().toUpperCase()
        );


        Transaction updated =
                repo.save(transaction);


        return convertToDTO(updated);
    }


    // =========================================================
    // CONVERT ENTITY TO DTO
    // =========================================================

    private TransactionDTO convertToDTO(
            Transaction transaction) {

        TransactionDTO dto =
                new TransactionDTO();


        dto.setId(
                transaction.getId()
        );


        dto.setAmount(
                transaction.getAmount()
        );


        dto.setReferenceId(
                transaction.getReferenceId()
        );


        dto.setLedgerId(
                transaction.getLedgerId()
        );


        // -----------------------------------------------------
        // SOURCE ACCOUNT
        // -----------------------------------------------------

        if (transaction.getSourceAccount() != null) {

            dto.setSourceAccountId(
                    transaction
                            .getSourceAccount()
                            .getId()
            );
        }


        // -----------------------------------------------------
        // TARGET ACCOUNT
        // -----------------------------------------------------

        if (transaction.getTargetAccount() != null) {

            dto.setTargetAccountId(
                    transaction
                            .getTargetAccount()
                            .getId()
            );
        }


        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        dto.setStatus(
                transaction.getStatus()
        );


        return dto;
    }


    // =========================================================
    // GET ALL
    // =========================================================

    public List<TransactionDTO> getAllTransactions() {

        return repo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET BY LEDGER
    // =========================================================

    public List<TransactionDTO> getTransactionsByLedger(
            String ledgerId) {

        return repo.findByLedgerId(ledgerId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    public Optional<Transaction> getTransactionById(
            Long id) {

        return repo.findById(id);
    }


    // =========================================================
    // REVERSE / DELETE
    // =========================================================

    public void reverseTransaction(
            Long id) {

        if (!repo.existsById(id)) {

            throw new RuntimeException(
                    "Transaction not found"
            );
        }

        repo.deleteById(id);
    }


    // =========================================================
    // LEDGER NORMALIZATION
    // =========================================================

    private String normalizeLedgerId(
            String ledgerId) {

        if (ledgerId == null) {
            return null;
        }

        String value =
                ledgerId.trim();

        if (value.isEmpty()) {
            return null;
        }

        return value;
    }
}