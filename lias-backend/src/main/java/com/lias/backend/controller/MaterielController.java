package com.lias.backend.controller;

import com.lias.backend.model.MaterielAttribution;
import com.lias.backend.model.MaterielItem;
import com.lias.backend.model.Membre;
import com.lias.backend.repository.MaterielAttributionRepository;
import com.lias.backend.repository.MaterielItemRepository;
import com.lias.backend.repository.MembreRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/materiel")
public class MaterielController {

    private final MaterielItemRepository items;
    private final MaterielAttributionRepository attributions;
    private final MembreRepository membres;
    @org.springframework.beans.factory.annotation.Autowired private com.lias.backend.service.JournalService journal;

    public MaterielController(MaterielItemRepository items, MaterielAttributionRepository attributions, MembreRepository membres) {
        this.items = items;
        this.attributions = attributions;
        this.membres = membres;
    }

    // --- Arrivages ---
    @GetMapping
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public List<MaterielItem> lister() { return items.findAll(); }

    @PostMapping
    @PreAuthorize("@accessPolicy.isDirecteur(authentication)")
    public ResponseEntity<MaterielItem> creerArrivage(@RequestBody MaterielItem item) {
        if(item.getNom()==null||item.getNom().isBlank()||item.getQuantiteTotal()<1) throw new IllegalArgumentException("Nom et quantité positive obligatoires");
        item.setId(null);
        items.save(item);journal.enregistrer("MATERIEL",item.getId(),"ARRIVAGE",item);
        return ResponseEntity.ok(item);
    }

    // --- Distribution ---
    @PostMapping("/{itemId}/attribuer")
    @PreAuthorize("@accessPolicy.isDirecteur(authentication)")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<MaterielAttribution> attribuer(@PathVariable Long itemId, @RequestParam Long membreId, @RequestParam(defaultValue = "1") int quantite) {
        MaterielItem item = items.verrouiller(itemId).orElseThrow(() -> new NoSuchElementException("Matériel introuvable"));
        Membre membre = membres.findById(membreId).orElseThrow(() -> new NoSuchElementException("Membre introuvable"));
        if(quantite<1)throw new IllegalArgumentException("Quantité positive obligatoire");
        int distribue=attributions.findAll().stream().filter(a->a.getItem().getId().equals(itemId)).mapToInt(MaterielAttribution::getQuantite).sum();
        if(quantite>item.getQuantiteTotal()-distribue)throw new IllegalStateException("Stock insuffisant");
        if(!com.lias.backend.service.MembreService.actif(membre.getStatutScientifique()))throw new IllegalArgumentException("Membre inactif");
        MaterielAttribution attribution = new MaterielAttribution();
        attribution.setItem(item);
        attribution.setMembre(membre);
        attribution.setQuantite(quantite);
        attributions.save(attribution);journal.enregistrer("MATERIEL",attribution.getItem().getId(),"ATTRIBUTION_OU_RECEPTION",attribution);
        return ResponseEntity.ok(attribution);
    }

    // Le bénéficiaire (ou la direction) confirme la réception
    @PutMapping("/attributions/{id}/recu")
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public ResponseEntity<?> confirmerReception(@PathVariable Long id, Authentication authentication) {
        MaterielAttribution attribution = attributions.findById(id).orElseThrow(() -> new NoSuchElementException("Attribution introuvable"));
        boolean estBeneficiaire = attribution.getMembre().getEmail().equalsIgnoreCase(authentication.getName());
        boolean estDirection = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DIRECTEUR"));
        if (!estBeneficiaire && !estDirection) return ResponseEntity.status(403).body(Map.of("message", "Seul le bénéficiaire ou la direction peut confirmer la réception"));
        attribution.setRecu(true);
        attribution.setDateReception(LocalDate.now());
        attributions.save(attribution);journal.enregistrer("MATERIEL",attribution.getItem().getId(),"ATTRIBUTION_OU_RECEPTION",attribution);
        return ResponseEntity.ok(attribution);
    }

    // Qui a reçu quoi / qui n'a pas reçu
    @GetMapping("/attributions")
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public List<MaterielAttribution> attributions(@RequestParam(required = false) Boolean recu) {
        return recu == null ? attributions.findAll() : attributions.findByRecu(recu);
    }

    @GetMapping("/attributions/membre/{membreId}")
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public List<MaterielAttribution> parMembre(@PathVariable Long membreId) {
        return attributions.findByMembreId(membreId);
    }
}
