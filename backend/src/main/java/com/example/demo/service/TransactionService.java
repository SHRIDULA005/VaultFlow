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


    /*
     * Only TREASURER and ADMIN are allowed
     * to create transactions.
     */
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public TransactionDTO createTransaction(TransactionDTO dto) {

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
                    "Target account is required"
            );
        }

        if (dto.getSourceAccountId()
                .equals(dto.getTargetAccountId())) {

            throw new IllegalArgumentException(
                    "Source and destination accounts cannot be the same"
            );
        }


        Transaction transaction = new Transaction();

        transaction.setAmount(
                dto.getAmount()
        );

        transaction.setReferenceId(
                dto.getReferenceId()
        );

        /*
         * If frontend does not send a status,
         * create the transaction as PENDING.
         */
        if (dto.getStatus() == null ||
                dto.getStatus().isBlank()) {

            transaction.setStatus("PENDING");

        } else {

            transaction.setStatus(
                    dto.getStatus().toUpperCase()
            );
        }

        transaction.setLedgerId(
                dto.getLedgerId()
        );


        Account source =
                accountRepo
                        .findById(dto.getSourceAccountId())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Source account not found: "
                                                + dto.getSourceAccountId()
                                )
                        );


        Account target =
                accountRepo
                        .findById(dto.getTargetAccountId())
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


        Transaction saved =
                repo.save(transaction);


        return convertToDTO(saved);
    }


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


        if (transaction.getSourceAccount() != null) {

            dto.setSourceAccountId(
                    transaction
                            .getSourceAccount()
                            .getId()
            );
        }


        if (transaction.getTargetAccount() != null) {

            dto.setTargetAccountId(
                    transaction
                            .getTargetAccount()
                            .getId()
            );
        }


        dto.setStatus(
                transaction.getStatus()
        );


        return dto;
    }


    public List<TransactionDTO> getAllTransactions() {

        return repo.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    public List<TransactionDTO> getTransactionsByLedger(
            String ledgerId) {

        return repo.findByLedgerId(ledgerId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }


    public Optional<Transaction> getTransactionById(
            Long id) {

        return repo.findById(id);
    }


    /*
     * Only TREASURER can approve/update
     * transaction status.
     */
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
                status.toUpperCase()
        );


        Transaction updated =
                repo.save(transaction);


        return convertToDTO(updated);
    }


    public void reverseTransaction(Long id) {

        repo.deleteById(id);
    }
}