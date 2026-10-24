package com.lias.backend;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lias.backend.config.JwtUtil;
import com.lias.backend.dto.MembreRequest;
import com.lias.backend.model.*;
import com.lias.backend.repository.*;
import com.lias.backend.service.MembreService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mock.web.MockMultipartFile;
import java.time.LocalDate;
import java.util.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @AutoConfigureMockMvc @Transactional
class ParcoursIntegrationTests {
 @Autowired MockMvc mvc;@Autowired ObjectMapper json;@Autowired MembreService service;@Autowired JwtUtil jwt;
 @Autowired MembreRepository membres;@Autowired ElementLaboratoireRepository elements;@Autowired NotificationRepository notifications;
 @Autowired AffiliationRepository affiliations;@Autowired MandatGouvernanceRepository mandats;@Autowired MaterielItemRepository materiel;
 Membre membre(StatutMembre statut,RoleGouvernance role){MembreRequest q=new MembreRequest();q.setNom("Test");q.setPrenom("Membre");q.setEmail(UUID.randomUUID()+"@test.fr");q.setMotDePasse("TestPass2026!");q.setDateNaissance(LocalDate.of(1990,1,2));q.setStatutInitial(statut);q.setRoleInitial(role);return service.inscrireMembre(q);}
 String token(Membre m){return "Bearer "+jwt.generateToken(m.getEmail(),m.getRoleGouvernance().name());}
 ElementLaboratoire element(String categorie,String owner){ElementLaboratoire e=new ElementLaboratoire();e.setTitre("Activité test");e.setCategorie(categorie);e.setCreePar(owner);e.setDateDebut(LocalDate.of(2025,4,2));return elements.save(e);}
 @Test void informationsConfidentiellesAbsentesDesProfils()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  mvc.perform(get("/api/membres").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$[0].motDePasse").doesNotExist()).andExpect(jsonPath("$[0].dateNaissance").doesNotExist());
  mvc.perform(get("/api/membres/mon-profil").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.dateNaissance").value("1990-01-02"));
 }
 @Test void organisateursInactifsRefusesMaisHistoriqueConserve()throws Exception{
  Membre auteur=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  Membre retraite=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  service.changerStatut(retraite.getId(),StatutMembre.RETRAITE);
  for(String champ:List.of("organisateurMembreId","organisateurs")){
   String meta=json.writeValueAsString(Map.of(champ,champ.equals("organisateurs")?List.of(retraite.getId()):retraite.getId()));
   String body=json.writeValueAsString(Map.of("categorie","EVENEMENTS","titre","TEST","metadata",meta));
   mvc.perform(post("/api/elements").header("Authorization",token(auteur)).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
  }
  ElementLaboratoire ancien=element("EVENEMENTS",auteur.getEmail());ancien.setMetadata(json.writeValueAsString(Map.of("organisateurs",List.of(retraite.getId()))));elements.save(ancien);
  mvc.perform(put("/api/elements/"+ancien.getId()).header("Authorization",token(auteur)).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(ancien))).andExpect(status().isOk());
 }
 @Test void rechercheNomCompletEtAccents()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  m.setPrenom("Faouzia");m.setNom("Bénabbou");membres.save(m);
  for(String q:List.of("Faouzia Benabbou","  benabbou   FAOUZIA  "))
   mvc.perform(get("/api/recherche").param("q",q).header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(1)).andExpect(jsonPath("$.membres[0].id").value(m.getId()));
 }
 @Test void ancienEtRetraiteNePeuventNiSeConnecterNiReutiliserLeurSession()throws Exception{
  Membre directeur=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);
  for(StatutMembre statut:List.of(StatutMembre.ANCIEN,StatutMembre.RETRAITE)){
   Membre cible=membre(StatutMembre.ASSOCIE,RoleGouvernance.MEMBRE_EQUIPE);
   String ancienToken=token(cible);
   mvc.perform(put("/api/membres/"+cible.getId()+"/statut").param("statut",statut.name()).header("Authorization",token(directeur))).andExpect(status().isOk()).andExpect(jsonPath("$.statutScientifique").value(statut.name()));
   mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",cible.getEmail(),"motDePasse","TestPass2026!")))).andExpect(status().isForbidden());
   mvc.perform(get("/api/auth/me").header("Authorization",ancienToken)).andExpect(status().isUnauthorized());
  }
 }
 @Test void candidatureRefuseePeutEtreRenouveleeSansPerdreHistorique()throws Exception{
  String email=UUID.randomUUID()+"@test.fr";
  String body=json.writeValueAsString(Map.of("nom","Test","prenom","Candidat","email",email,"motivation","Recherche","motDePasse","TestPass2026!"));
  var first=mvc.perform(post("/api/adhesions/public").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk()).andReturn();
  var initial=json.readTree(first.getResponse().getContentAsString());
  mvc.perform(post("/api/adhesions/public").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
  Membre directeur=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);
  mvc.perform(put("/api/adhesions/"+initial.path("demande").path("id").asLong()+"/decision").param("accepter","false").header("Authorization",token(directeur))).andExpect(status().isOk());
  var second=mvc.perform(post("/api/adhesions/public").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk()).andReturn();
  assertNotEquals(initial.path("codeSuivi").asText(),json.readTree(second.getResponse().getContentAsString()).path("codeSuivi").asText());
  mvc.perform(post("/api/adhesions/public/suivi").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("code",initial.path("codeSuivi").asText())))).andExpect(status().isOk()).andExpect(jsonPath("$.statut").value("REFUSEE"));
 }
 @Test void pieceJointePubliqueSeulementPourPublicationCourante()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  var upload=mvc.perform(multipart("/api/documents/upload").file(new MockMultipartFile("fichier","article.pdf","application/pdf","TEST PDF".getBytes())).header("Authorization",token(m))).andExpect(status().isOk()).andReturn();
  String url=json.readTree(upload.getResponse().getContentAsString()).get("url").asText();
  String publicUrl=url.replace("/fichier/","/publications/");
  mvc.perform(get(publicUrl)).andExpect(status().isForbidden());
  ElementLaboratoire publication=element("PUBLICATIONS",m.getEmail());publication.setDocumentUrl(url);elements.save(publication);
  mvc.perform(get(publicUrl)).andExpect(status().isOk()).andExpect(content().bytes("TEST PDF".getBytes()));
  publication.setStatut("ARCHIVE");elements.save(publication);
  mvc.perform(get(publicUrl)).andExpect(status().isForbidden());
  publication.setStatut("ACTIF");publication.setCategorie("DOCUMENTS");elements.save(publication);
  mvc.perform(get(publicUrl)).andExpect(status().isForbidden());
 }
 @Test void administrateurTechniqueNePossedePasLesDroitsMetier()throws Exception{
  Membre admin=membre(StatutMembre.PERMANENT,RoleGouvernance.ADMIN);
  String auth=token(admin);
  mvc.perform(get("/api/membres").header("Authorization",auth)).andExpect(status().isOk());
  mvc.perform(get("/api/mandats").header("Authorization",auth)).andExpect(status().isOk());
  for(String path:List.of("/api/adhesions","/api/materiel","/api/elements/rapport-annuel/2026"))
   mvc.perform(get(path).header("Authorization",auth)).andExpect(status().isForbidden());
  mvc.perform(post("/api/materiel").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content("{\"nom\":\"TEST\",\"quantiteTotal\":2}")).andExpect(status().isForbidden());
  for(String categorie:List.of("EVENEMENTS","PUBLICATIONS","DOCUMENTS","CONVENTIONS","PV")){
   mvc.perform(get("/api/elements").param("categorie",categorie).header("Authorization",auth)).andExpect(status().isForbidden());
   mvc.perform(post("/api/elements").header("Authorization",auth).contentType(MediaType.APPLICATION_JSON).content("{\"categorie\":\""+categorie+"\",\"titre\":\"TEST\"}")).andExpect(status().isForbidden());
  }
 }
 @Test void directeurModifieRoleDepuisFicheMembreEtPermanentEstRefuse()throws Exception{
  Membre directeur=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);
  Membre cible=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  String body="{\"roleInitial\":\"CHEF_EQUIPE\",\"equipeNom\":\"TEST-ROLE\"}";
  mvc.perform(put("/api/membres/"+cible.getId()).header("Authorization",token(cible)).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isForbidden());
  mvc.perform(put("/api/membres/"+cible.getId()).header("Authorization",token(directeur)).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk()).andExpect(jsonPath("$.roleGouvernance").value("CHEF_EQUIPE"));
  assertTrue(mandats.findAllByMembreId(cible.getId()).stream().anyMatch(h->h.estActif()&&h.getRole()==RoleGouvernance.CHEF_EQUIPE&&"TEST-ROLE".equals(h.getEquipeNom())));
 }
 @Test void doctorantPeutPublierMaisPasAccederAuxArchives()throws Exception{
  Membre m=membre(StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);
  mvc.perform(post("/api/elements").header("Authorization",token(m)).contentType(MediaType.APPLICATION_JSON).content("{\"categorie\":\"PUBLICATIONS\",\"titre\":\"Article\"}")).andExpect(status().isOk());
  mvc.perform(get("/api/elements").param("categorie","DOCUMENTS").header("Authorization",token(m))).andExpect(status().isForbidden());
  mvc.perform(get("/api/elements/rapport-annuel/2025").header("Authorization",token(m))).andExpect(status().isForbidden());
 }
 @Test void rechercheNeContournePasLaCategorie()throws Exception{
  Membre m=membre(StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);element("DOCUMENTS",m.getEmail());element("PUBLICATIONS",m.getEmail());
  mvc.perform(get("/api/elements").param("categorie","PUBLICATIONS").param("q","Activité").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1)).andExpect(jsonPath("$[0].categorie").value("PUBLICATIONS"));
 }
 @Test void categorieFalsifieeNePermetPasDeModifierDocument()throws Exception{
  Membre m=membre(StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);ElementLaboratoire e=element("DOCUMENTS",m.getEmail());
  mvc.perform(put("/api/elements/"+e.getId()).header("Authorization",token(m)).contentType(MediaType.APPLICATION_JSON).content("{\"categorie\":\"PUBLICATIONS\",\"titre\":\"Fraude\"}")).andExpect(status().isForbidden());
 }
 @Test void doctorantNeModifiePasPublicationAutrui()throws Exception{
  Membre m=membre(StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);ElementLaboratoire e=element("PUBLICATIONS","autre@test.fr");
  mvc.perform(delete("/api/elements/"+e.getId()).header("Authorization",token(m))).andExpect(status().isForbidden());
 }
 @Test void retraitBloqueAussiUnJetonDejaEmis()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);String t=token(m);service.changerStatut(m.getId(),StatutMembre.RETRAITE);
  mvc.perform(get("/api/membres").header("Authorization",t)).andExpect(status().isUnauthorized());
 }
 @Test void retourOuvreNouvelleAffiliationSansPerdreHistorique(){
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);service.changerStatut(m.getId(),StatutMembre.ANCIEN);service.changerStatut(m.getId(),StatutMembre.PERMANENT);
  var a=affiliations.findByMembreIdOrderByDateDebutDesc(m.getId());assertEquals(2,a.size());assertEquals(1,a.stream().filter(x->x.getDateFin()==null).count());
 }
 @Test void notificationsPrivees()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);Notification n=new Notification();n.setDestinataire("autre@test.fr");n.setTitre("Privé");notifications.save(n);
  mvc.perform(get("/api/notifications").param("email","autre@test.fr").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
  mvc.perform(put("/api/notifications/"+n.getId()+"/lue").header("Authorization",token(m))).andExpect(status().isForbidden());
 }
 @Test void espacePublicNeDivulguePasPV()throws Exception{
  element("PV","admin@test.fr");mvc.perform(get("/api/public/contenus").param("categorie","PV")).andExpect(status().isForbidden());
 }
 @Test void mandatExpireRetireDroitsDirecteur()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);var h=mandats.findAllByMembreId(m.getId()).getFirst();h.setDateFin(LocalDate.now());mandats.save(h);
  mvc.perform(get("/api/adhesions").header("Authorization",token(m))).andExpect(status().isForbidden());
 }
 @Test void stockNeDevientPasNegatif()throws Exception{
  Membre admin=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);MaterielItem i=new MaterielItem();i.setNom("PC");i.setQuantiteTotal(1);materiel.save(i);
  mvc.perform(post("/api/materiel/"+i.getId()+"/attribuer").param("membreId",admin.getId().toString()).param("quantite","2").header("Authorization",token(admin))).andExpect(status().isConflict());
 }
 @Test void depotDecisionEtConnexionCandidat()throws Exception{
  Membre directeur=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);
  String email=UUID.randomUUID()+"@test.fr";
  String result=mvc.perform(post("/api/adhesions/public").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("nom","Candidat","prenom","Test","email",email,"motivation","Recherche","motDePasse","Secret2026!")))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  var response=json.readTree(result);long id=response.path("demande").path("id").asLong();String code=response.path("codeSuivi").asText();
  mvc.perform(put("/api/adhesions/"+id+"/decision").param("accepter","true").header("Authorization",token(directeur))).andExpect(status().isOk());
  mvc.perform(post("/api/adhesions/public/suivi").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("code",code)))).andExpect(status().isOk()).andExpect(jsonPath("$.statut").value("ACCEPTEE"));
  mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",email,"motDePasse","Secret2026!")))).andExpect(status().isOk()).andExpect(jsonPath("$.token").isString());
  assertEquals(1,affiliations.findByMembreIdOrderByDateDebutDesc(membres.findByEmail(email).orElseThrow().getId()).size());
 }
 @Test void uploadEtTelechargementAvecAuthentification()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  var file=new MockMultipartFile("fichier","rapport.pdf","application/pdf","%PDF-test".getBytes());
  String data=mvc.perform(multipart("/api/documents/upload").file(file).header("Authorization",token(m))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  String url=json.readTree(data).path("url").asText();mvc.perform(get(url).header("Authorization",token(m))).andExpect(status().isOk()).andExpect(content().bytes("%PDF-test".getBytes()));
  mvc.perform(get(url)).andExpect(status().isUnauthorized());
 }
 @Test void profilPersonnelNeChangePasLesDroits()throws Exception{
  Membre m=membre(StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);
  mvc.perform(put("/api/membres/mon-profil").header("Authorization",token(m)).contentType(MediaType.APPLICATION_JSON).content("{\"nom\":\"Nouveau\",\"roleInitial\":\"ADMIN\",\"statutInitial\":\"PERMANENT\"}")).andExpect(status().isOk());
  assertEquals(RoleGouvernance.MEMBRE_EQUIPE,m.getRoleGouvernance());assertEquals(StatutMembre.DOCTORANT,m.getStatutScientifique());
 }
 @Test void rapportInclutArchivesEtRespecteAnnee()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);ElementLaboratoire e=element("EVENEMENTS",m.getEmail());e.setStatut("ARCHIVE");elements.save(e);
  mvc.perform(get("/api/elements/rapport-annuel/2025").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.activites.EVENEMENTS").value(1));
  mvc.perform(get("/api/elements/rapport-annuel/2024").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.details.length()").value(0));
 }
 @Test void jetonMalformeRenvoie401()throws Exception{mvc.perform(get("/api/membres").header("Authorization","Bearer invalide")).andExpect(status().isUnauthorized());}

 @Autowired com.lias.backend.service.RapportAnnuelService rapportService;
 @Autowired RapportAnnuelRepository rapports;
 @Autowired JournalActiviteRepository journal;
 @Test void clotureAutomatiqueConserveUnRapportParAnnee(){
  element("PUBLICATIONS","a@test.fr");rapportService.cloturerAnnees();String avant=rapports.findById(2025).orElseThrow().getContenu();
  element("EVENEMENTS","a@test.fr");rapportService.cloturerAnnees();assertEquals(avant,rapports.findById(2025).orElseThrow().getContenu());
 }
 @Test void modificationDocumentConserveVersionPrecedente()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);ElementLaboratoire e=element("DOCUMENTS",m.getEmail());e.setDescription("Version initiale");elements.save(e);
  mvc.perform(put("/api/elements/"+e.getId()).header("Authorization",token(m)).contentType(MediaType.APPLICATION_JSON).content("{\"categorie\":\"DOCUMENTS\",\"titre\":\"Version suivante\"}")).andExpect(status().isOk());
  assertTrue(journal.findByTypeAndCibleIdOrderByDateDesc("ELEMENT",e.getId()).stream().anyMatch(h->h.getContenu().contains("Version initiale")));
 }

 @Test void associeParticipeUneSeuleFoisEtDoctorantEstBloque()throws Exception{
  Membre associe=membre(StatutMembre.ASSOCIE,RoleGouvernance.MEMBRE_EQUIPE);Membre doctorant=membre(StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);var e=element("EVENEMENTS",associe.getEmail());String url="/api/evenements/"+e.getId()+"/participations";
  mvc.perform(post(url).header("Authorization",token(associe))).andExpect(status().isOk());
  mvc.perform(post(url).header("Authorization",token(associe))).andExpect(status().isOk());
  mvc.perform(get(url).header("Authorization",token(associe))).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
  mvc.perform(post(url).header("Authorization",token(doctorant))).andExpect(status().isForbidden());
 }

 @Test void evenementGenereNotificationPuisLecturePersiste()throws Exception{
  Membre m=membre(StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  mvc.perform(post("/api/elements").header("Authorization",token(m)).contentType(MediaType.APPLICATION_JSON).content("{\"categorie\":\"EVENEMENTS\",\"titre\":\"Séminaire notification\"}")).andExpect(status().isOk());
  var liste=notifications.findByDestinataireOrderByCreeLeDesc(m.getEmail());assertEquals(1,liste.size());assertFalse(liste.getFirst().isLue());
  mvc.perform(put("/api/notifications/"+liste.getFirst().getId()+"/lue").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$.lue").value(true));
  mvc.perform(get("/api/notifications").header("Authorization",token(m))).andExpect(status().isOk()).andExpect(jsonPath("$[0].lue").value(true)).andExpect(jsonPath("$[0].titre").value("Nouvel événement"));
 }
}
