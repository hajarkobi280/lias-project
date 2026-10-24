package com.lias.backend.controller;
import com.lias.backend.model.*;
import com.lias.backend.repository.*;
import com.lias.backend.service.*;
import com.lias.backend.config.AccessPolicy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@RestController @RequestMapping("/api/elements") @Transactional
public class ElementLaboratoireController {
 private final ElementLaboratoireRepository repository;
 private final NotificationService notifications;
 private final JournalService journal;
 private final JournalActiviteRepository historique;
 @org.springframework.beans.factory.annotation.Autowired private MembreRepository membres;
 private final AccessPolicy policy;
 @org.springframework.beans.factory.annotation.Autowired private RapportAnnuelService rapports;
 @org.springframework.beans.factory.annotation.Autowired private RapportAnnuelRepository rapportsArchives;
 public ElementLaboratoireController(ElementLaboratoireRepository repository,NotificationService notifications,JournalService journal,JournalActiviteRepository historique,AccessPolicy policy){this.repository=repository;this.notifications=notifications;this.journal=journal;this.historique=historique;this.policy=policy;}
 @GetMapping @PreAuthorize("@accessPolicy.canRead(authentication,#categorie)")
 public List<ElementLaboratoire> lister(@RequestParam(required=false) String categorie,@RequestParam(required=false) String q){
  return repository.findAll().stream().filter(e->categorie==null||categorie.isBlank()||categorie.equals(e.getCategorie()))
   .filter(e->q==null||q.isBlank()||(e.getTitre()+" "+e.getDescription()+" "+e.getResponsable()+" "+e.getMetadata()).toLowerCase(Locale.ROOT).contains(q.toLowerCase(Locale.ROOT)))
   .sorted(Comparator.comparing(ElementLaboratoire::getDateDebut,Comparator.nullsLast(Comparator.reverseOrder()))).toList();
 }
 @org.springframework.beans.factory.annotation.Autowired private com.fasterxml.jackson.databind.ObjectMapper mapper;
 private void valider(ElementLaboratoire e){
  if(e.getMetadata()!=null&&!e.getMetadata().isBlank())try{if(!mapper.readTree(e.getMetadata()).isObject())throw new IllegalArgumentException("Métadonnées invalides");}catch(com.fasterxml.jackson.core.JsonProcessingException ex){throw new IllegalArgumentException("Métadonnées invalides");}
  if(!AccessPolicy.CATEGORIES.contains(e.getCategorie()==null?"":e.getCategorie()))throw new IllegalArgumentException("Catégorie inconnue");
  if(e.getTitre()==null||e.getTitre().isBlank())throw new IllegalArgumentException("Titre obligatoire");
  if(e.getDateFin()!=null&&(e.getDateDebut()==null||e.getDateFin().isBefore(e.getDateDebut())))throw new IllegalArgumentException("Période invalide");
  if(e.getDocumentUrl()!=null&&!e.getDocumentUrl().isBlank()&&!e.getDocumentUrl().startsWith("/api/documents/fichier/")&&!e.getDocumentUrl().matches("https?://.+"))throw new IllegalArgumentException("Lien de document invalide");
 }
 private Set<Long> organisateurs(ElementLaboratoire e){
  if(e==null||e.getMetadata()==null||e.getMetadata().isBlank())return Set.of();
  try{
   var meta=mapper.readTree(e.getMetadata());Set<Long> ids=new HashSet<>();
   var principal=meta.path("organisateurMembreId");
   if(!principal.isMissingNode()&&!principal.isNull()&&!principal.asText().isBlank())ids.add(Long.parseLong(principal.asText()));
   var autres=meta.path("organisateurs");
   if(!autres.isMissingNode()&&!autres.isArray())throw new IllegalArgumentException("Liste des organisateurs invalide");
   for(var id:autres)ids.add(Long.parseLong(id.asText()));
   return ids;
  }catch(com.fasterxml.jackson.core.JsonProcessingException|NumberFormatException ex){throw new IllegalArgumentException("Organisateurs invalides");}
 }
 private void validerOrganisateurs(ElementLaboratoire entree,ElementLaboratoire precedent){
  if(!"EVENEMENTS".equals(entree.getCategorie()))return;
  Set<Long> historiques=organisateurs(precedent);
  for(Long id:organisateurs(entree)){
   if(historiques.contains(id))continue;
   Membre m=membres.findById(id).orElseThrow(()->new IllegalArgumentException("Organisateur introuvable"));
   if(!MembreService.actif(m.getStatutScientifique()))throw new IllegalArgumentException("Un membre retraité ou ancien ne peut pas être ajouté comme organisateur");
  }
 }
 private void attribuerAuteur(ElementLaboratoire e,Authentication a){
  if("PUBLICATIONS".equals(e.getCategorie())&&!policy.accesInterne(a)){
   try{var meta=(com.fasterxml.jackson.databind.node.ObjectNode)(e.getMetadata()==null||e.getMetadata().isBlank()?mapper.createObjectNode():mapper.readTree(e.getMetadata()));
    var membre=membres.findByEmail(a.getName()).orElseThrow();meta.put("auteurMembreId",membre.getId());e.setMetadata(mapper.writeValueAsString(meta));
   }catch(com.fasterxml.jackson.core.JsonProcessingException ex){throw new IllegalArgumentException("Métadonnées invalides");}
  }
 }
 private void autoriserModification(ElementLaboratoire e,Authentication a){
  if(!policy.canWrite(a,e.getCategorie()))throw new AccessDeniedException("Accès interdit");
  if(!policy.accesInterne(a)&&!a.getName().equals(e.getCreePar()))throw new AccessDeniedException("Vous pouvez modifier uniquement vos publications");
 }
 @PostMapping @PreAuthorize("@accessPolicy.canWrite(authentication,#element.categorie)")
 public ResponseEntity<ElementLaboratoire> creer(@RequestBody ElementLaboratoire element,Authentication a){
  valider(element);validerOrganisateurs(element,null);attribuerAuteur(element,a);element.setId(null);element.setCreePar(a.getName());element.setCreeLe(LocalDateTime.now());
  if(element.getDateDebut()==null)element.setDateDebut(LocalDate.now());
  ElementLaboratoire saved=repository.save(element);journal.enregistrer("ELEMENT",saved.getId(),"CREATION",saved);
  if("EVENEMENTS".equals(saved.getCategorie()))notifications.notifierTousActifs("Nouvel événement",saved.getTitre());
  if("DOCUMENTS".equals(saved.getCategorie()))notifications.notifierTousActifs("Nouveau document",saved.getTitre());
  return ResponseEntity.ok(saved);
 }
 @PutMapping("/{id}") public ResponseEntity<ElementLaboratoire> modifier(@PathVariable Long id,@RequestBody ElementLaboratoire entree,Authentication a){
  ElementLaboratoire e=repository.findById(id).orElseThrow();autoriserModification(e,a);
  if(!Objects.equals(e.getCategorie(),entree.getCategorie()))throw new IllegalArgumentException("La catégorie ne peut pas être modifiée");
  valider(entree);validerOrganisateurs(entree,e);attribuerAuteur(entree,a);journal.enregistrer("ELEMENT",id,"AVANT_MODIFICATION",e);
  e.setTitre(entree.getTitre());e.setDescription(entree.getDescription());e.setStatut(entree.getStatut());e.setResponsable(entree.getResponsable());
  e.setDateDebut(entree.getDateDebut());e.setDateFin(entree.getDateFin());e.setDocumentUrl(entree.getDocumentUrl());e.setMetadata(entree.getMetadata());
  repository.save(e);journal.enregistrer("ELEMENT",id,"MODIFICATION",e);return ResponseEntity.ok(e);
 }
 @DeleteMapping("/{id}") public ResponseEntity<Void> archiver(@PathVariable Long id,Authentication a){
  ElementLaboratoire e=repository.findById(id).orElseThrow();autoriserModification(e,a);journal.enregistrer("ELEMENT",id,"AVANT_ARCHIVAGE",e);
  e.setStatut("ARCHIVE");repository.save(e);journal.enregistrer("ELEMENT",id,"ARCHIVAGE",e);return ResponseEntity.noContent().build();
 }
 @GetMapping("/{id}/historique") public List<JournalActivite> historique(@PathVariable Long id,Authentication a){
  ElementLaboratoire e=repository.findById(id).orElseThrow();if(!policy.canRead(a,e.getCategorie()))throw new AccessDeniedException("Accès interdit");
  return historique.findByTypeAndCibleIdOrderByDateDesc("ELEMENT",id);
 }
 @GetMapping("/rapport-annuel/{annee}") @PreAuthorize("@accessPolicy.accesInterne(authentication)")
 public Map<String,Object> rapport(@PathVariable int annee){
  return rapports.calculer(annee);
 }
 @GetMapping("/rapports-archives") @PreAuthorize("@accessPolicy.accesInterne(authentication)")
 public List<RapportAnnuel> rapportsArchives(){return rapportsArchives.findAll();}
}
