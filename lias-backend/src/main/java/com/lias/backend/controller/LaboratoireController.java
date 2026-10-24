package com.lias.backend.controller;
import com.lias.backend.model.Laboratoire;import com.lias.backend.repository.LaboratoireRepository;import com.lias.backend.service.JournalService;
import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.transaction.annotation.Transactional;
@RestController public class LaboratoireController {
 private final LaboratoireRepository repo;private final JournalService journal;
 public LaboratoireController(LaboratoireRepository repo,JournalService journal){this.repo=repo;this.journal=journal;}
 @GetMapping("/api/public/laboratoire") public Laboratoire lire(){return repo.findById(1L).orElseGet(Laboratoire::new);}
 @PutMapping("/api/laboratoire") @PreAuthorize("@accessPolicy.isAdmin(authentication)") @Transactional
 public Laboratoire modifier(@RequestBody Laboratoire l){if(l.getNom()==null||l.getNom().isBlank()||l.getDateCreation()==null||l.getDateCreation().isAfter(java.time.LocalDate.now()))throw new IllegalArgumentException("Nom et date de création valides obligatoires");l.setId(1L);journal.enregistrer("LABORATOIRE",1L,"AVANT_MODIFICATION",lire());repo.save(l);journal.enregistrer("LABORATOIRE",1L,"MODIFICATION",l);return l;}
}
