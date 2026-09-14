package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.example.demo.dto.LedgerDTO;
import com.example.demo.model.Ledger;
import com.example.demo.repository.LedgerRepository;

@Service
public class LedgerService {

    @Autowired
    private LedgerRepository repo;


    // =========================================================
    // CREATE LEDGER
    // =========================================================

    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public Ledger createLedger(Ledger ledger) {

        return repo.save(ledger);
    }


    // =========================================================
    // GET LEDGER BY ID
    // =========================================================

    public Optional<Ledger> getLedgerById(Long id) {

        return repo.findById(id);
    }


    // =========================================================
    // GET ALL LEDGERS - PAGINATED
    // =========================================================

    public Page<LedgerDTO> getAllLedgers(Pageable pageable) {

        Page<Ledger> ledgers = repo.findAll(pageable);

        return ledgers.map(this::convertToDTO);
    }


    // =========================================================
    // GET ALL LEDGERS - WITHOUT PAGINATION
    // =========================================================
    // This method is provided because your Controller is
    // currently calling getAllLedgers() without Pageable.
    // =========================================================

    public java.util.List<Ledger> getAllLedgers() {

        return repo.findAll();
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
    // =========================================================

    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public Ledger updateLedger(
            Long id,
            Ledger ledger) {

        Ledger existingLedger = repo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Ledger not found"
                        )
                );

        existingLedger.setDescription(
                ledger.getDescription()
        );

        existingLedger.setCreatedAt(
                ledger.getCreatedAt()
        );

        return repo.save(existingLedger);
    }


    // =========================================================
    // DELETE LEDGER
    // =========================================================

    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public void deleteLedger(Long id) {

        if (!repo.existsById(id)) {

            throw new RuntimeException(
                    "Ledger not found"
            );
        }

        repo.deleteById(id);
    }
}