package com.lias.backend.controller;

import com.lias.backend.model.HistoriqueStatut;
import com.lias.backend.repository.HistoriqueStatutRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Consultation de l'historique des affiliations/statuts (section 4.3) :
 * les entrées sont déjà créées automatiquement par MembreService à chaque
 * changement de statut ; ce contrôleur les rend simplement consultables.
 */
@RestController
@RequestMapping("/api/historique-statuts")
public class HistoriqueStatutController {

    private final HistoriqueStatutRepository historique;

    public HistoriqueStatutController(HistoriqueStatutRepository historique) {
        this.historique = historique;
    }

    @GetMapping("/membre/{membreId}")
    @PreAuthorize("@accessPolicy.accesInterne(authentication) or @accessPolicy.canManageMembers(authentication)")
    public List<HistoriqueStatut> parMembre(@PathVariable Long membreId) {
        return historique.findAllByMembreId(membreId);
    }
}
