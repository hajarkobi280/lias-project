package com.lias.backend.controller;
import com.lias.backend.model.*;import com.lias.backend.repository.*;import com.lias.backend.service.JournalService;
import org.springframework.web.bind.annotation.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.core.Authentication;import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@RestController @RequestMapping("/api/evenements/{id}/participations") @PreAuthorize("@accessPolicy.canRead(authentication,'EVENEMENTS')")
public class ParticipationController {
 private final ParticipationEvenementRepository repo;private final ElementLaboratoireRepository elements;private final MembreRepository membres;private final JournalService journal;
 public ParticipationController(ParticipationEvenementRepository repo,ElementLaboratoireRepository elements,MembreRepository membres,JournalService journal){this.repo=repo;this.elements=elements;this.membres=membres;this.journal=journal;}
 private ElementLaboratoire evenement(Long id){var e=elements.findById(id).orElseThrow();if(!"EVENEMENTS".equals(e.getCategorie()))throw new IllegalArgumentException("Événement introuvable");return e;}
 @GetMapping public List<ParticipationEvenement> lister(@PathVariable Long id){evenement(id);return repo.findByEvenementId(id);}
 @PostMapping @Transactional public ParticipationEvenement participer(@PathVariable Long id,Authentication a){
  var e=evenement(id);if("ARCHIVE".equals(e.getStatut()))throw new IllegalStateException("Événement archivé");
  var m=membres.findByEmail(a.getName()).orElseThrow();var existant=repo.findByEvenementIdAndMembreId(id,m.getId());if(existant.isPresent())return existant.get();
  var p=new ParticipationEvenement();p.setMembre(m);p.setEvenement(e);repo.save(p);journal.enregistrer("EVENEMENT",id,"PARTICIPATION",Map.of("membreId",m.getId()));return p;
 }
}
