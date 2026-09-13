// package com.example.demo.controller;

// import java.util.List;
// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import com.example.demo.model.AuditLog;
// import com.example.demo.service.AuditService;

// import jakarta.validation.Valid;

// @RestController
// @RequestMapping("/api/audit")
// public class AuditController {

//     @Autowired
//     private AuditService auditService;


//     @PostMapping
//     public ResponseEntity<String> postAuditLog(@Valid @RequestBody AuditLog auditLog) {
//         return ResponseEntity.status(HttpStatus.CREATED)
//                 .body(auditService.postAuditLog(auditLog));
//     }


//     @GetMapping
//     public ResponseEntity<List<AuditLog>> getAllAudit() {
//         return ResponseEntity.ok(auditService.getAllAudit());
//     }

 
//     @GetMapping("/{id}")
//     public ResponseEntity<AuditLog> getAuditById(@PathVariable Long id) {
//         Optional<AuditLog> audit = auditService.getAuditById(id);

//         return audit.map(ResponseEntity::ok)
//                 .orElse(ResponseEntity.notFound().build());
//     }

  
//     @PutMapping("/{id}")
//     public ResponseEntity<AuditLog> updateAudit(
//             @PathVariable Long id,
//             @Valid @RequestBody AuditLog auditLog) {

//         AuditLog updated = auditService.updateAudit(id, auditLog);
//         return ResponseEntity.ok(updated);
//     }

    
//     @DeleteMapping("/{id}")
//     public ResponseEntity<String> deleteAudit(@PathVariable Long id) {
//         auditService.deleteAudit(id);
//         return ResponseEntity.ok("Audit deleted successfully.");
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

import com.example.demo.model.AuditLog;
import com.example.demo.service.AuditService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;


    @PostMapping
    public ResponseEntity<String> postAuditLog(
            @Valid @RequestBody AuditLog auditLog) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(auditService.postAuditLog(auditLog));
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR')")
    public ResponseEntity<List<AuditLog>> getAllAudit() {

        return ResponseEntity.ok(
                auditService.getAllAudit()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getAuditById(
            @PathVariable Long id) {

        Optional<AuditLog> audit =
                auditService.getAuditById(id);

        return audit
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    @PutMapping("/{id}")
    public ResponseEntity<AuditLog> updateAudit(
            @PathVariable Long id,
            @Valid @RequestBody AuditLog auditLog) {

        AuditLog updated =
                auditService.updateAudit(
                        id,
                        auditLog
                );

        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAudit(
            @PathVariable Long id) {

        auditService.deleteAudit(id);

        return ResponseEntity.ok(
                "Audit deleted successfully."
        );
    }
}