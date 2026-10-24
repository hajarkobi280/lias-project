package com.lias.backend.controller;

import com.lias.backend.dto.MembreRequest;
import com.lias.backend.model.Membre;
import com.lias.backend.service.MembreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import com.lias.backend.model.StatutMembre;

@RestController
@RequestMapping("/api/membres")
public class MembreController {

    @Autowired
    private MembreService membreService;

    // GET : récupérer tous les membres
    @GetMapping
    public List<Membre> obtenirTousLesMembres() {
        return membreService.getAllMembres();
    }

    // POST : créer un nouveau membre
    @PostMapping
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<Membre> ajouterMembre(@RequestBody MembreRequest membreRequest) {
        Membre nouveauMembre = membreService.inscrireMembre(membreRequest);
        return ResponseEntity.ok(nouveauMembre);
    }

    // PUT : modifier un membre existant
    @PutMapping("/{id}")
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<Membre> modifierMembre(
            @PathVariable Long id,
            @RequestBody MembreRequest membreRequest) {
        Membre membreMisAJour = membreService.modifierMembre(id, membreRequest);
        return ResponseEntity.ok(membreMisAJour);
    }

    // DELETE : supprimer un membre
    @DeleteMapping("/{id}")
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<Void> supprimerMembre(@PathVariable Long id) {
        membreService.supprimerMembre(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/statut")
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<Membre> changerStatut(@PathVariable Long id, @RequestParam StatutMembre statut) {
        return ResponseEntity.ok(membreService.changerStatut(id, statut));
    }

    // Modification libre du profil PAR le membre lui-même (section 3) — aucun droit de gestion requis
    @PutMapping("/mon-profil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Membre> modifierMonProfil(
            @RequestBody MembreRequest membreRequest,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(membreService.modifierMonProfil(authentication.getName(), membreRequest));
    }

    // Changement de rôle/mandat dédié (section 5.3 et 7) — indépendant d'une modification complète du membre
    @PutMapping("/{id}/role")
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<Membre> changerRole(
            @PathVariable Long id,
            @RequestParam com.lias.backend.model.RoleGouvernance role,
            @RequestParam(required = false) String equipeNom) {
        return ResponseEntity.ok(membreService.changerRole(id, role, equipeNom));
    }

    @Autowired private com.lias.backend.repository.MembreRepository membres;
    @Autowired private com.lias.backend.repository.AffiliationRepository affiliations;
    @Autowired private com.lias.backend.repository.JournalActiviteRepository journal;
    @GetMapping("/mon-profil")
    public java.util.Map<String,Object> monProfil(org.springframework.security.core.Authentication a) {
        Membre m = membres.findByEmail(a.getName()).orElseThrow();
        java.util.Map<String,Object> result = new java.util.LinkedHashMap<>();
        result.put("membre",m);result.put("dateNaissance",m.getDateNaissance());return result;
    }
    @GetMapping("/{id}/affiliations")
    @PreAuthorize("@accessPolicy.accesInterne(authentication) or @accessPolicy.canManageMembers(authentication)")
    public java.util.List<com.lias.backend.model.Affiliation> affiliations(@PathVariable Long id) {return affiliations.findByMembreIdOrderByDateDebutDesc(id);}
    @GetMapping("/{id}/historique")
    @PreAuthorize("@accessPolicy.accesInterne(authentication) or @accessPolicy.canManageMembers(authentication)")
    public java.util.List<com.lias.backend.model.JournalActivite> historique(@PathVariable Long id) {return journal.findByTypeAndCibleIdOrderByDateDesc("MEMBRE",id);}
}
