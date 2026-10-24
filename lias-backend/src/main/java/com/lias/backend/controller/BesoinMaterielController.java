package com.lias.backend.controller;

import com.lias.backend.model.BesoinMateriel;
import com.lias.backend.model.Membre;
import com.lias.backend.repository.BesoinMaterielRepository;
import com.lias.backend.repository.MembreRepository;
import com.lias.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/besoins-materiel")
@org.springframework.transaction.annotation.Transactional
public class BesoinMaterielController {

    @org.springframework.beans.factory.annotation.Autowired private com.lias.backend.service.JournalService journal;
    private final BesoinMaterielRepository besoins;
    private final MembreRepository membres;
    private final NotificationService notificationService;

    public BesoinMaterielController(BesoinMaterielRepository besoins, MembreRepository membres, NotificationService notificationService) {
        this.besoins = besoins;
        this.membres = membres;
        this.notificationService = notificationService;
    }

    // Un membre soumet un besoin (module interne — hors accès doctorant)
    @PostMapping
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public ResponseEntity<BesoinMateriel> soumettre(@RequestBody BesoinMateriel demande, Authentication authentication) {
        Membre demandeur = membres.findByEmail(authentication.getName()).orElseThrow(() -> new NoSuchElementException("Membre introuvable"));
        if(demande.getDesignation()==null||demande.getDesignation().isBlank())throw new IllegalArgumentException("Désignation obligatoire");
        demande.setId(null);
        demande.setDemandeur(demandeur);
        demande.setStatut("EN_ATTENTE");
        demande.setDateDemande(LocalDate.now());
        demande.setDateDecision(null);
        besoins.save(demande);journal.enregistrer("BESOIN",demande.getId(),"SOUMISSION",demande);
        notificationService.notifierDirection("Nouveau besoin en matériel",demande.getDesignation());
        return ResponseEntity.ok(demande);
    }

    // Toutes les demandes — réservé à la direction
    @GetMapping
    @PreAuthorize("@accessPolicy.isDirecteur(authentication)")
    public List<BesoinMateriel> lister() { return besoins.findAll(); }

    // Mes propres demandes
    @GetMapping("/mes-demandes")
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public List<BesoinMateriel> mesDemandes(Authentication authentication) {
        Membre demandeur = membres.findByEmail(authentication.getName()).orElseThrow(() -> new NoSuchElementException("Membre introuvable"));
        return besoins.findByDemandeurId(demandeur.getId());
    }

    // Validation / refus par la direction
    @PutMapping("/{id}/decision")
    @PreAuthorize("@accessPolicy.isDirecteur(authentication)")
    public ResponseEntity<BesoinMateriel> decider(@PathVariable Long id, @RequestParam boolean valider) {
        BesoinMateriel demande = besoins.findById(id).orElseThrow(() -> new NoSuchElementException("Demande introuvable"));
        if(!"EN_ATTENTE".equals(demande.getStatut()))throw new IllegalStateException("Demande déjà traitée");
        demande.setStatut(valider ? "VALIDEE" : "REFUSEE");
        demande.setDateDecision(LocalDate.now());
        BesoinMateriel sauvegardee = besoins.save(demande);
        journal.enregistrer("BESOIN",id,"DECISION",sauvegardee);
        notificationService.notifier(demande.getDemandeur().getEmail(),
                valider ? "Besoin en matériel validé" : "Besoin en matériel refusé",
                "Votre demande \"" + demande.getDesignation() + "\" a été " + (valider ? "validée" : "refusée") + " par la direction.");
        return ResponseEntity.ok(sauvegardee);
    }
}
