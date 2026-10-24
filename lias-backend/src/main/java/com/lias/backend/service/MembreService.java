package com.lias.backend.service;
import com.lias.backend.dto.MembreRequest;
import com.lias.backend.model.*;
import com.lias.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service @Transactional
public class MembreService {
 private final MembreRepository membres;
 private final HistoriqueStatutRepository statuts;
 private final MandatGouvernanceRepository mandats;
 private final AffiliationRepository affiliations;
 private final PasswordEncoder encoder;
 private final JournalService journal;
 public MembreService(MembreRepository membres,HistoriqueStatutRepository statuts,MandatGouvernanceRepository mandats,AffiliationRepository affiliations,PasswordEncoder encoder,JournalService journal){this.membres=membres;this.statuts=statuts;this.mandats=mandats;this.affiliations=affiliations;this.encoder=encoder;this.journal=journal;}
 public List<Membre> getAllMembres(){return membres.findAll();}
 public static boolean actif(StatutMembre s){return s!=StatutMembre.ANCIEN&&s!=StatutMembre.RETRAITE;}
 public Membre trouver(Long id){return membres.findById(id).orElseThrow();}
 private void profil(Membre m,MembreRequest q){
  if(q.getNom()!=null){if(q.getNom().isBlank())throw new IllegalArgumentException("Nom obligatoire");m.setNom(q.getNom().trim());}
  if(q.getPrenom()!=null){if(q.getPrenom().isBlank())throw new IllegalArgumentException("Prénom obligatoire");m.setPrenom(q.getPrenom().trim());}
  if(q.getPhotoUrl()!=null)m.setPhotoUrl(q.getPhotoUrl());
  if(q.getBiographie()!=null)m.setBiographie(q.getBiographie());
  if(q.getCentresInteret()!=null)m.setCentresInteret(q.getCentresInteret());
  if(q.getEtablissementOrigine()!=null)m.setEtablissementOrigine(q.getEtablissementOrigine());
  if(q.getLaboratoireOrigine()!=null)m.setLaboratoireOrigine(q.getLaboratoireOrigine());
  if(q.getDateNaissance()!=null){if(q.getDateNaissance().isAfter(LocalDate.now()))throw new IllegalArgumentException("Date de naissance invalide");m.setDateNaissance(q.getDateNaissance());}
  if(q.getMotDePasse()!=null&&!q.getMotDePasse().isBlank()){
   if(q.getMotDePasse().length()<8)throw new IllegalArgumentException("Le mot de passe doit contenir au moins 8 caractères");
   m.setMotDePasse(encoder.encode(q.getMotDePasse()));
  }
 }
 public Membre inscrireMembre(MembreRequest q){
  if(q.getNom()==null||q.getPrenom()==null||q.getEmail()==null||!q.getEmail().contains("@"))throw new IllegalArgumentException("Nom, prénom et email valides obligatoires");
  if(q.getMotDePasse()==null||q.getMotDePasse().isBlank())throw new IllegalArgumentException("Mot de passe obligatoire");
  Membre m=new Membre();profil(m,q);m.setEmail(q.getEmail().trim().toLowerCase(Locale.ROOT));
  m.setDateEmbauche(q.getDateEmbauche());m.setDateAffiliation(q.getDateAffiliation()==null?LocalDate.now():q.getDateAffiliation());m.setEquipeNom(q.getEquipeNom());
  m.setStatutScientifique(q.getStatutInitial()==null?StatutMembre.ASSOCIE:q.getStatutInitial());m.setRoleGouvernance(RoleGouvernance.MEMBRE_EQUIPE);
  membres.save(m);historiserStatut(m,m.getDateAffiliation());
  if(actif(m.getStatutScientifique()))ouvrirAffiliation(m,m.getDateAffiliation());
  changerRole(m.getId(),q.getRoleInitial()==null?RoleGouvernance.MEMBRE_EQUIPE:q.getRoleInitial(),q.getEquipeNom());
  journal.enregistrer("MEMBRE",m.getId(),"CREATION",m);return m;
 }
 public Membre modifierMembre(Long id,MembreRequest q){
  Membre m=trouver(id);journal.enregistrer("MEMBRE",id,"AVANT_MODIFICATION",m);profil(m,q);
  if(q.getEmail()!=null){if(!q.getEmail().contains("@"))throw new IllegalArgumentException("Email invalide");m.setEmail(q.getEmail().trim().toLowerCase(Locale.ROOT));}
  if(q.getDateEmbauche()!=null)m.setDateEmbauche(q.getDateEmbauche());
  if(q.getEquipeNom()!=null)m.setEquipeNom(q.getEquipeNom());
  if(q.getStatutInitial()!=null&&q.getStatutInitial()!=m.getStatutScientifique())changerStatut(id,q.getStatutInitial());
  if(q.getRoleInitial()!=null&&q.getRoleInitial()!=m.getRoleGouvernance())changerRole(id,q.getRoleInitial(),q.getEquipeNom());
  membres.save(m);journal.enregistrer("MEMBRE",id,"MODIFICATION",m);return m;
 }
 private void historiserStatut(Membre m,LocalDate debut){
  HistoriqueStatut h=new HistoriqueStatut();h.setMembre(m);h.setStatut(m.getStatutScientifique());h.setDateDebut(debut);statuts.save(h);
 }
 private void ouvrirAffiliation(Membre m,LocalDate debut){Affiliation a=new Affiliation();a.setMembre(m);a.setDateDebut(debut);affiliations.save(a);}
 public void supprimerMembre(Long id){changerStatut(id,StatutMembre.ANCIEN);}
 public Membre changerStatut(Long id,StatutMembre statut){
  Membre m=trouver(id);if(statut==null)throw new IllegalArgumentException("Statut obligatoire");if(statut==m.getStatutScientifique())return m;
  boolean etaitActif=actif(m.getStatutScientifique());
  if(etaitActif&&affiliations.findByMembreIdOrderByDateDebutDesc(id).isEmpty())ouvrirAffiliation(m,m.getDateAffiliation()==null?LocalDate.now():m.getDateAffiliation());
  statuts.findByMembreIdAndDateFinIsNull(id).ifPresent(h->{h.setDateFin(LocalDate.now());statuts.save(h);});
  m.setStatutScientifique(statut);historiserStatut(m,LocalDate.now());
  if(etaitActif&&!actif(statut)){
   affiliations.findByMembreIdAndDateFinIsNull(id).ifPresent(a->{a.setDateFin(LocalDate.now());affiliations.save(a);});
   fermerMandats(id);m.setRoleGouvernance(RoleGouvernance.MEMBRE_EQUIPE);
  }else if(!etaitActif&&actif(statut)){m.setDateAffiliation(LocalDate.now());ouvrirAffiliation(m,LocalDate.now());}
  if(statut==StatutMembre.DOCTORANT){fermerMandats(id);m.setRoleGouvernance(RoleGouvernance.MEMBRE_EQUIPE);}
  membres.save(m);journal.enregistrer("MEMBRE",id,"CHANGEMENT_STATUT",m);return m;
 }
 private void fermerMandats(Long id){mandats.findAllByMembreId(id).stream().filter(h->h.getDateFin()==null||h.getDateFin().isAfter(LocalDate.now())).forEach(h->{h.setDateFin(LocalDate.now());mandats.save(h);});}
 public Membre changerRole(Long id,RoleGouvernance role,String equipe){return attribuerMandat(id,role,equipe,null);}
 public Membre attribuerMandat(Long id,RoleGouvernance role,String equipe,LocalDate fin){
  Membre m=trouver(id);if(role==null)throw new IllegalArgumentException("Rôle obligatoire");
  if(role!=RoleGouvernance.MEMBRE_EQUIPE&&(!actif(m.getStatutScientifique())||m.getStatutScientifique()==StatutMembre.DOCTORANT))throw new IllegalArgumentException("Ce statut ne permet pas de mandat");
  if(fin!=null&&!fin.isAfter(LocalDate.now()))throw new IllegalArgumentException("La fin doit être postérieure à aujourd'hui");
  if(role==RoleGouvernance.CHEF_EQUIPE&&(equipe==null||equipe.isBlank()))throw new IllegalArgumentException("Équipe obligatoire pour un chef d'équipe");
  // Un seul titulaire actif par responsabilité de direction ou équipe.
  if(role==RoleGouvernance.DIRECTEUR||role==RoleGouvernance.VICE_DIRECTEUR||role==RoleGouvernance.CHEF_EQUIPE){
   boolean occupe=mandats.findAll().stream().anyMatch(h->h.estActif()&&h.getRole()==role&&!h.getMembre().getId().equals(id)&&(role!=RoleGouvernance.CHEF_EQUIPE||Objects.equals(equipe,h.getEquipeNom())));
   if(occupe)throw new IllegalStateException("Clôturez d'abord le mandat du titulaire actuel");
  }
  fermerMandats(id);MandatGouvernance h=new MandatGouvernance();h.setMembre(m);h.setRole(role);h.setEquipeNom(equipe);h.setDateDebut(LocalDate.now());h.setDateFin(fin);mandats.save(h);
  m.setRoleGouvernance(role);membres.save(m);journal.enregistrer("MEMBRE",id,"CHANGEMENT_ROLE",h);return m;
 }
 public Membre modifierMonProfil(String email,MembreRequest q){
  Membre m=membres.findByEmail(email).orElseThrow();journal.enregistrer("MEMBRE",m.getId(),"AVANT_MODIFICATION_PROFIL",m);profil(m,q);
  membres.save(m);journal.enregistrer("MEMBRE",m.getId(),"MODIFICATION_PROFIL",m);return m;
 }
}
