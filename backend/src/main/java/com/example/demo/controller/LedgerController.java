package com.example.demo.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.LedgerDTO;
import com.example.demo.model.Ledger;
import com.example.demo.service.LedgerService;

@RestController
@RequestMapping("/api/ledgers")
public class LedgerController {

    @Autowired
    private LedgerService ser;

    @PostMapping
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<String> postLedger(
            @RequestBody Ledger ledger) {

        return ResponseEntity.ok(
                ser.postledger(ledger)
        );
    }

    @PreAuthorize("hasAnyRole('AUDITOR', 'TREASURER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<Page<LedgerDTO>> getAllLedgers(
            Pageable pageable) {

        return ResponseEntity.ok(
                ser.getAllLedgers(pageable)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Ledger>> getLedgerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ser.getledgerbyid(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<Ledger> updateLedger(
            @PathVariable Long id,
            @RequestBody Ledger ledger) {

        return ResponseEntity.ok(
                ser.updateLedger(id, ledger)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TREASURER', 'ADMIN')")
    public ResponseEntity<String> deleteLedger(
            @PathVariable Long id) {

        ser.deleteLedger(id);

        return ResponseEntity.ok(
                "Ledger deleted successfully."
        );
    }
}