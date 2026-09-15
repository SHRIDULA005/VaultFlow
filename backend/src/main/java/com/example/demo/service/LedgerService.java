package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.LedgerDTO;
import com.example.demo.model.Ledger;
import com.example.demo.repository.LedgerRepository;

@Service
@Transactional
public class LedgerService {

    @Autowired
    private LedgerRepository ledgerRepository;


    // =========================================================
    // CREATE LEDGER
    // AUDITOR / ADMIN ONLY
    // =========================================================

    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public Ledger createLedger(Ledger ledger) {

        if (ledger == null) {
            throw new IllegalArgumentException(
                    "Ledger data cannot be null"
            );
        }

        if (ledger.getDescription() == null ||
                ledger.getDescription().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Ledger description cannot be empty"
            );
        }

        ledger.setDescription(
                ledger.getDescription().trim()
        );

        return ledgerRepository.save(ledger);
    }


    // =========================================================
    // GET LEDGER BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Ledger getLedgerById(Long id) {

        validateId(id);

        return ledgerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Ledger not found with ID: " + id
                        )
                );
    }


    // =========================================================
    // GET ALL LEDGERS
    // NON-PAGINATED
    // =========================================================

    @Transactional(readOnly = true)
    public List<Ledger> getAllLedgers() {

        return ledgerRepository.findAll();
    }


    // =========================================================
    // GET ALL LEDGERS
    // PAGINATED
    // =========================================================

    public Page<LedgerDTO> getAllLedgers(Pageable pageable) {

        if (pageable == null) {
            throw new IllegalArgumentException(
                    "Pageable cannot be null"
            );
        }

        Page<Ledger> ledgers =
                ledgerRepository.findAll(pageable);

        return ledgers.map(this::convertToDTO);
    }


    // =========================================================
    // CONVERT LEDGER ENTITY TO DTO
    // =========================================================

    private LedgerDTO convertToDTO(Ledger ledger) {

        LedgerDTO dto = new LedgerDTO();

        dto.setId(ledger.getId());

        dto.setDescription(
                ledger.getDescription()
        );

        dto.setCreatedAt(
                ledger.getCreatedAt()
        );

        return dto;
    }


    // =========================================================
    // UPDATE LEDGER
    // AUDITOR / ADMIN ONLY
    // =========================================================

    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public Ledger updateLedger(
            Long id,
            Ledger ledger) {

        validateId(id);

        if (ledger == null) {
            throw new IllegalArgumentException(
                    "Ledger data cannot be null"
            );
        }

        if (ledger.getDescription() == null ||
                ledger.getDescription().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Ledger description cannot be empty"
            );
        }

        Ledger existingLedger =
                ledgerRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Ledger not found with ID: " + id
                                )
                        );

        existingLedger.setDescription(
                ledger.getDescription().trim()
        );

        /*
         * Only update createdAt when a value is supplied.
         * This prevents accidentally replacing the existing
         * date with null.
         */
        if (ledger.getCreatedAt() != null) {
            existingLedger.setCreatedAt(
                    ledger.getCreatedAt()
            );
        }

        return ledgerRepository.save(existingLedger);
    }


    // =========================================================
    // DELETE LEDGER
    // AUDITOR / ADMIN ONLY
    // =========================================================

    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public void deleteLedger(Long id) {

        validateId(id);

        if (!ledgerRepository.existsById(id)) {

            throw new RuntimeException(
                    "Ledger not found with ID: " + id
            );
        }

        ledgerRepository.deleteById(id);
    }


    // =========================================================
    // CHECK LEDGER EXISTS
    // =========================================================

    @Transactional(readOnly = true)
    public boolean ledgerExists(Long id) {

        validateId(id);

        return ledgerRepository.existsById(id);
    }


    // =========================================================
    // VALIDATE ID
    // =========================================================

    private void validateId(Long id) {

        if (id == null || id <= 0) {

            throw new IllegalArgumentException(
                    "Ledger ID must be a positive number"
            );
        }
    }
}