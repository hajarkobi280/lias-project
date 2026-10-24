package com.lias.backend.controller;

import com.lias.backend.model.MandatGouvernance;
import com.lias.backend.model.RoleGouvernance;
import com.lias.backend.repository.MandatGouvernanceRepository;
import com.lias.backend.service.MembreService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Gestion des mandats de gouvernance (section 5.3 et 7 du cahier des charges) :
 * consultation de l'historique + API dédiée pour attribuer/clôturer un mandat
 * sans passer par une modification complète du membre.
 */
@RestController
@RequestMapping("/api/mandats")
public class MandatGouvernanceController {

    private final MandatGouvernanceRepository mandats;
    private final MembreService membreService;

    public MandatGouvernanceController(MandatGouvernanceRepository mandats, MembreService membreService) {
        this.mandats = mandats;
        this.membreService = membreService;
    }

    // Historique complet des mandats (tous membres, actifs et clôturés)
    @GetMapping
    @PreAuthorize("@accessPolicy.accesInterne(authentication) or @accessPolicy.canManageMembers(authentication)")
    public List<MandatGouvernance> lister() {
        return mandats.findAll();
    }

    // Mandats actuellement actifs (dateFin == null) — "qui gouverne en ce moment"
    @GetMapping("/actifs")
    @PreAuthorize("@accessPolicy.accesInterne(authentication) or @accessPolicy.canManageMembers(authentication)")
    public List<MandatGouvernance> actifs() {
        return mandats.findAll().stream().filter(MandatGouvernance::estActif).toList();
    }

    // Historique des mandats d'un membre donné
    @GetMapping("/membre/{membreId}")
    @PreAuthorize("@accessPolicy.accesInterne(authentication) or @accessPolicy.canManageMembers(authentication)")
    public List<MandatGouvernance> parMembre(@PathVariable Long membreId) {
        return mandats.findAllByMembreId(membreId);
    }

    // Attribuer un nouveau mandat à un membre (clôture automatiquement son mandat actif précédent)
    @PostMapping
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<?> attribuer(@RequestParam Long membreId, @RequestParam RoleGouvernance role,
                                        @RequestParam(required = false) String equipeNom, @RequestParam(required = false) java.time.LocalDate dateFin) {
        return ResponseEntity.ok(membreService.attribuerMandat(membreId, role, equipeNom, dateFin));
    }

    // Clôturer un mandat sans en attribuer un nouveau (le membre redevient MEMBRE_EQUIPE)
    @PutMapping("/{id}/cloturer")
    @PreAuthorize("@accessPolicy.canManageMembers(authentication)")
    public ResponseEntity<?> cloturer(@PathVariable Long id) {
        MandatGouvernance mandat = mandats.findById(id).orElseThrow(() -> new NoSuchElementException("Mandat introuvable"));
        if (!mandat.estActif()) throw new IllegalStateException("Ce mandat est déjà clôturé");
        return ResponseEntity.ok(membreService.changerRole(mandat.getMembre().getId(), RoleGouvernance.MEMBRE_EQUIPE, null));
    }
}
