package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    // TREASURER and ADMIN can create transactions.
    // =========================================================

    @Transactional
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public TransactionDTO createTransaction(TransactionDTO dto) {

        validateTransactionRequest(dto);

        Account source = findAccount(
                dto.getSourceAccountId(),
                "Source account"
        );

        Account target = findAccount(
                dto.getTargetAccountId(),
                "Destination account"
        );

        validateDifferentAccounts(
                dto.getSourceAccountId(),
                dto.getTargetAccountId()
        );

        Transaction transaction = new Transaction();

        transaction.setAmount(dto.getAmount());

        transaction.setReferenceId(
                dto.getReferenceId().trim()
        );

        transaction.setStatus(
                normalizeStatus(dto.getStatus())
        );

        transaction.setLedgerId(
                normalizeLedgerId(dto.getLedgerId())
        );

        transaction.setSourceAccount(source);
        transaction.setTargetAccount(target);

        Transaction saved = repo.save(transaction);

        return convertToDTO(saved);
    }


    // =========================================================
    // UPDATE COMPLETE TRANSACTION
    // =========================================================
    // TREASURER and ADMIN can edit every editable field.
    // =========================================================

    @Transactional
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public TransactionDTO updateTransaction(
            Long id,
            TransactionDTO dto) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Transaction ID is required"
            );
        }

        validateTransactionRequest(dto);

        Transaction transaction = repo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Transaction not found: " + id
                        )
                );

        validateDifferentAccounts(
                dto.getSourceAccountId(),
                dto.getTargetAccountId()
        );

        Account source = findAccount(
                dto.getSourceAccountId(),
                "Source account"
        );

        Account target = findAccount(
                dto.getTargetAccountId(),
                "Destination account"
        );

        // -----------------------------------------------------
        // UPDATE ALL EDITABLE FIELDS
        // -----------------------------------------------------

        transaction.setAmount(
                dto.getAmount()
        );

        transaction.setReferenceId(
                dto.getReferenceId().trim()
        );

        transaction.setSourceAccount(
                source
        );

        transaction.setTargetAccount(
                target
        );

        transaction.setStatus(
                normalizeStatus(dto.getStatus())
        );

        transaction.setLedgerId(
                normalizeLedgerId(dto.getLedgerId())
        );

        Transaction updated = repo.save(transaction);

        return convertToDTO(updated);
    }


    // =========================================================
    // UPDATE TRANSACTION STATUS
    // =========================================================
    // Kept for existing code that only updates status.
    // =========================================================

    @Transactional
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public TransactionDTO updateTransactionStatus(
            Long id,
            String status) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Transaction ID is required"
            );
        }

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Transaction status is required"
            );
        }

        Transaction transaction = repo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Transaction not found: " + id
                        )
                );

        transaction.setStatus(
                normalizeStatus(status)
        );

        Transaction updated = repo.save(transaction);

        return convertToDTO(updated);
    }


    // =========================================================
    // GET ALL TRANSACTIONS
    // =========================================================
    // Any authenticated user can view all transactions.
    // Role restriction is intentionally NOT applied here.
    // =========================================================

    public List<TransactionDTO> getAllTransactions() {

        return repo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET TRANSACTIONS BY LEDGER
    // =========================================================
    // Any authenticated user can view transactions by ledger.
    // =========================================================

    public List<TransactionDTO> getTransactionsByLedger(
            String ledgerId) {

        if (ledgerId == null || ledgerId.isBlank()) {
            throw new IllegalArgumentException(
                    "Ledger ID is required"
            );
        }

        return repo.findByLedgerId(ledgerId.trim())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    // =========================================================
    // GET TRANSACTION BY ID
    // =========================================================
    // Any authenticated user can view a transaction.
    // =========================================================

    public Optional<Transaction> getTransactionById(
            Long id) {

        if (id == null) {
            return Optional.empty();
        }

        return repo.findById(id);
    }


    // =========================================================
    // REVERSE / DELETE TRANSACTION
    // =========================================================
    // TREASURER and ADMIN can reverse/delete transactions.
    // =========================================================

    @Transactional
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public void reverseTransaction(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Transaction ID is required"
            );
        }

        if (!repo.existsById(id)) {
            throw new RuntimeException(
                    "Transaction not found: " + id
            );
        }

        repo.deleteById(id);
    }


    // =========================================================
    // VALIDATE TRANSACTION REQUEST
    // =========================================================

    private void validateTransactionRequest(
            TransactionDTO dto) {

        if (dto == null) {
            throw new IllegalArgumentException(
                    "Transaction data is required"
            );
        }

        if (dto.getAmount() == null ||
                dto.getAmount() <= 0) {

            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero"
            );
        }

        if (dto.getReferenceId() == null ||
                dto.getReferenceId().isBlank()) {

            throw new IllegalArgumentException(
                    "Transaction reference ID is required"
            );
        }

        if (dto.getSourceAccountId() == null) {
            throw new IllegalArgumentException(
                    "Source account is required"
            );
        }

        if (dto.getTargetAccountId() == null) {
            throw new IllegalArgumentException(
                    "Destination account is required"
            );
        }
    }


    // =========================================================
    // VALIDATE SOURCE / DESTINATION
    // =========================================================

    private void validateDifferentAccounts(
            Long sourceAccountId,
            Long targetAccountId) {

        if (sourceAccountId == null ||
                targetAccountId == null) {

            return;
        }

        if (sourceAccountId.equals(targetAccountId)) {

            throw new IllegalArgumentException(
                    "Source and destination accounts cannot be the same"
            );
        }
    }


    // =========================================================
    // FIND ACCOUNT
    // =========================================================

    private Account findAccount(
            Long accountId,
            String accountLabel) {

        return accountRepo.findById(accountId)
                .orElseThrow(
                        () -> new RuntimeException(
                                accountLabel
                                        + " not found: "
                                        + accountId
                        )
                );
    }


    // =========================================================
    // NORMALIZE STATUS
    // =========================================================

    private String normalizeStatus(String status) {

        if (status == null || status.isBlank()) {
            return "PENDING";
        }

        String normalized =
                status.trim().toUpperCase();

        // Keep the statuses used by the existing UI/API.
        if (!normalized.equals("PENDING") &&
                !normalized.equals("APPROVED") &&
                !normalized.equals("REJECTED")) {

            throw new IllegalArgumentException(
                    "Invalid transaction status: "
                            + status
            );
        }

        return normalized;
    }


    // =========================================================
    // NORMALIZE LEDGER ID
    // =========================================================

    private String normalizeLedgerId(
            String ledgerId) {

        if (ledgerId == null) {
            return null;
        }

        String value =
                ledgerId.trim();

        return value.isEmpty()
                ? null
                : value;
    }


    // =========================================================
    // ENTITY -> DTO
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
}
