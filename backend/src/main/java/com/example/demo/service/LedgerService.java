package com.example.demo.service;

import java.util.List;
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
    LedgerRepository repo;

    public String postledger(Ledger l){
        repo.save(l);
        return "Ledger added succesfully";
    }

    // public List<Ledger> Getallledger(){
    //     List<Ledger> ans=repo.findAll();
    //     return ans;
    // }

    public Optional<Ledger> getledgerbyid(Long id){
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
}
