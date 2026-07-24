package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.demo.dto.LedgerDTO;
import com.example.demo.model.Ledger;
import com.example.demo.repository.LedgerRepository;

@Service
public class LedgerService {

    @Autowired
    private LedgerRepository repo;

    
    public String postledger(Ledger ledger) {
        repo.save(ledger);
        return "Ledger added succesfully";
    }

    
    public Optional<Ledger> getledgerbyid(Long id) {
        return repo.findById(id);
    }

    
    public Page<LedgerDTO> getAllLedgers(Pageable pageable) {

        Page<Ledger> ledgers = repo.findAll(pageable);

        return ledgers.map(this::convertToDTO);
    }

    
    private LedgerDTO convertToDTO(Ledger ledger) {

        LedgerDTO dto = new LedgerDTO();

        dto.setId(ledger.getId());
        dto.setDescription(ledger.getDescription());
        dto.setCreatedAt(ledger.getCreatedAt());

        return dto;
    }

    
    public Ledger updateLedger(Long id, Ledger ledger) {

        Ledger existingLedger = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger not found"));

        existingLedger.setDescription(ledger.getDescription());
        existingLedger.setCreatedAt(ledger.getCreatedAt());

        return repo.save(existingLedger);
    }

    
    public void deleteLedger(Long id) {

        if (!repo.existsById(id)) {
            throw new RuntimeException("Ledger not found");
        }

        repo.deleteById(id);
    }
}