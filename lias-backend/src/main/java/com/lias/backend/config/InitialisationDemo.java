package com.lias.backend.config;
import com.lias.backend.dto.MembreRequest;import com.lias.backend.model.*;import com.lias.backend.repository.MembreRepository;import com.lias.backend.service.MembreService;
import org.springframework.boot.CommandLineRunner;import org.springframework.context.annotation.Profile;import org.springframework.stereotype.Component;
@Component @Profile("demo") public class InitialisationDemo implements CommandLineRunner {
 private final MembreRepository membres;private final MembreService service;
 public InitialisationDemo(MembreRepository membres,MembreService service){this.membres=membres;this.service=service;}
 public void run(String... args){if(membres.count()!=0)return;
  creer("admin@lias.demo",StatutMembre.PERMANENT,RoleGouvernance.ADMIN);
  creer("directeur@lias.demo",StatutMembre.PERMANENT,RoleGouvernance.DIRECTEUR);
  creer("membre@lias.demo",StatutMembre.PERMANENT,RoleGouvernance.MEMBRE_EQUIPE);
  creer("doctorant@lias.demo",StatutMembre.DOCTORANT,RoleGouvernance.MEMBRE_EQUIPE);
  creer("associe@lias.demo",StatutMembre.ASSOCIE,RoleGouvernance.MEMBRE_EQUIPE);
 }
 private void creer(String email,StatutMembre statut,RoleGouvernance role){MembreRequest q=new MembreRequest();q.setNom("Démonstration");q.setPrenom(email.split("@")[0]);q.setEmail(email);q.setMotDePasse("LiasDemo2026!");q.setStatutInitial(statut);q.setRoleInitial(role);q.setEquipeNom("IA et systèmes");service.inscrireMembre(q);}
}
