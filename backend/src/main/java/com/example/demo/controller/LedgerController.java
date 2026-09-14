package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Ledger;
import com.example.demo.service.LedgerService;


@RestController
@RequestMapping("/api/ledgers")
public class LedgerController {


    @Autowired
    private LedgerService ledgerService;


    // =========================================================
    // GET ALL LEDGERS
    // =========================================================

    @GetMapping
    public List<Ledger> getAllLedgers() {

        return ledgerService.getAllLedgers();
    }


    // =========================================================
    // GET LEDGER BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Ledger getLedgerById(
            @PathVariable Long id) {

        return ledgerService.getLedgerById(id);
    }


    // =========================================================
    // CREATE LEDGER
    // AUDITOR + ADMIN
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public Ledger createLedger(
            @RequestBody Ledger ledger) {

        return ledgerService.createLedger(ledger);
    }


    // =========================================================
    // UPDATE LEDGER
    // AUDITOR + ADMIN
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public Ledger updateLedger(
            @PathVariable Long id,
            @RequestBody Ledger ledger) {

        return ledgerService.updateLedger(
                id,
                ledger
        );
    }


    // =========================================================
    // DELETE LEDGER
    // AUDITOR + ADMIN
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AUDITOR', 'ADMIN')")
    public void deleteLedger(
            @PathVariable Long id) {

        ledgerService.deleteLedger(id);
    }
}