package com.lias.backend.controller;
import com.lias.backend.model.*;import com.lias.backend.dto.MembreRequest;import com.lias.backend.repository.*;import com.lias.backend.service.*;
import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;import org.springframework.transaction.annotation.Transactional;import java.time.LocalDateTime;import java.util.*;
@RestController @RequestMapping("/api/adhesions") @Transactional
public class DemandeAdhesionController {
 private final DemandeAdhesionRepository demandes;private final MembreRepository membres;private final MembreService service;private final PasswordEncoder encoder;private final NotificationService notifications;private final JournalService journal;
 public DemandeAdhesionController(DemandeAdhesionRepository demandes,MembreRepository membres,MembreService service,PasswordEncoder encoder,NotificationService notifications,JournalService journal){this.demandes=demandes;this.membres=membres;this.service=service;this.encoder=encoder;this.notifications=notifications;this.journal=journal;}
 @PostMapping("/public") public Map<String,Object> soumettre(@RequestBody DemandeAdhesion d){
  if(d.getNom()==null||d.getNom().isBlank()||d.getPrenom()==null||d.getPrenom().isBlank()||d.getEmail()==null||!d.getEmail().contains("@")||d.getMotivation()==null||d.getMotivation().isBlank())throw new IllegalArgumentException("Veuillez compléter la candidature");
  if(d.getMotDePasse()==null||d.getMotDePasse().length()<8)throw new IllegalArgumentException("Choisissez un mot de passe d'au moins 8 caractères");
  d.setEmail(d.getEmail().trim().toLowerCase(Locale.ROOT));if(membres.existsByEmail(d.getEmail()))throw new IllegalStateException("Un compte existe déjà pour cet email");
  if(demandes.existsByEmailAndStatut(d.getEmail(),"EN_ATTENTE"))throw new IllegalStateException("Une candidature est déjà en attente pour cet email. Consultez son suivi.");
  d.setId(null);d.setVersion(null);d.setStatut("EN_ATTENTE");d.setTraiteLe(null);d.setDecisionPar(null);d.setCreeLe(LocalDateTime.now());
  d.setMotDePasse(encoder.encode(d.getMotDePasse()));d.setSuiviToken(UUID.randomUUID().toString());demandes.save(d);
  journal.enregistrer("ADHESION",d.getId(),"SOUMISSION",d);notifications.notifierDirection("Nouvelle adhésion",d.getPrenom()+" "+d.getNom());
  return Map.of("demande",d,"codeSuivi",d.getSuiviToken());
 }
 @PostMapping("/public/suivi") public Map<String,Object> suivi(@RequestBody Map<String,String> body){
  DemandeAdhesion d=demandes.findAll().stream().filter(x->x.getSuiviToken()!=null&&x.getSuiviToken().equals(body.get("code"))).findFirst().orElseThrow();
  return Map.of("statut",d.getStatut(),"message",switch(d.getStatut()){case "ACCEPTEE"->"Votre adhésion est acceptée. Connectez-vous avec le mot de passe choisi lors du dépôt.";case "REFUSEE"->"Votre candidature n'a pas été retenue.";default->"Votre candidature est en cours d'examen.";});
 }
 @GetMapping @PreAuthorize("@accessPolicy.isDirecteur(authentication)") public List<DemandeAdhesion> lister(){return demandes.findAll();}
 @PutMapping("/{id}/decision") @PreAuthorize("@accessPolicy.isDirecteur(authentication)")
 public Map<String,Object> decision(@PathVariable Long id,@RequestParam boolean accepter,Authentication a){
  DemandeAdhesion d=demandes.findById(id).orElseThrow();if(!"EN_ATTENTE".equals(d.getStatut()))throw new IllegalStateException("Cette demande a déjà été traitée");
  if(accepter){
   if(membres.existsByEmail(d.getEmail()))throw new IllegalStateException("Un compte existe déjà pour cet email");
   if(d.getMotDePasse()==null)throw new IllegalStateException("Ancienne candidature sans mot de passe : demander un nouveau dépôt");
   MembreRequest q=new MembreRequest();q.setNom(d.getNom());q.setPrenom(d.getPrenom());q.setEmail(d.getEmail());q.setMotDePasse(UUID.randomUUID().toString());q.setEtablissementOrigine(d.getEtablissementOrigine());q.setLaboratoireOrigine(d.getLaboratoireOrigine());
   Membre m=service.inscrireMembre(q);m.setMotDePasse(d.getMotDePasse());membres.save(m);
  }
  d.setStatut(accepter?"ACCEPTEE":"REFUSEE");d.setTraiteLe(LocalDateTime.now());d.setDecisionPar(a.getName());demandes.save(d);
  journal.enregistrer("ADHESION",id,"DECISION",d);notifications.notifier(d.getEmail(),"Décision d'adhésion",accepter?"Votre adhésion est acceptée.":"Votre adhésion est refusée.");
  return Map.of("demande",d,"membre",accepter?"cree":"non_concerne");
 }
}
