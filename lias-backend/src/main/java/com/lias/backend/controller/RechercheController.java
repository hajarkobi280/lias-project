package com.lias.backend.controller;

import com.lias.backend.model.ElementLaboratoire;
import com.lias.backend.model.Membre;
import com.lias.backend.repository.ElementLaboratoireRepository;
import com.lias.backend.repository.MembreRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Recherche globale transverse (section 18) : membres, documents, événements,
 * publications... tout ce qui est indexé dans Membre et ElementLaboratoire,
 * en un seul appel, groupé par type.
 */
@RestController
@RequestMapping("/api/recherche")
public class RechercheController {

    private final MembreRepository membres;
    private final ElementLaboratoireRepository elements;

    public RechercheController(MembreRepository membres, ElementLaboratoireRepository elements) {
        this.membres = membres;
        this.elements = elements;
    }

    @GetMapping
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public Map<String, Object> rechercher(@RequestParam String q) {
        if (q == null || q.isBlank()) {
            return Map.of("membres", List.of(), "elements", Map.of(), "total", 0);
        }
        String[] termes = normaliser(q).trim().split("\\s+");
        List<Membre> membresTrouves = membres.findAll().stream()
                .filter(m -> correspond(termes, m.getPrenom()+" "+m.getNom()+" "+m.getEmail()+" "+m.getEquipeNom())).toList();
        List<ElementLaboratoire> elementsTrouves = elements.findAll().stream()
                .filter(e -> correspond(termes,e.getTitre()+" "+e.getDescription()+" "+e.getResponsable()+" "+e.getMetadata())).toList();

        // Regroupement des éléments par catégorie (événements, publications, documents, conventions, PV...)
        Map<String, List<ElementLaboratoire>> elementsParCategorie = elementsTrouves.stream()
                .collect(java.util.stream.Collectors.groupingBy(ElementLaboratoire::getCategorie));

        return Map.of(
                "membres", membresTrouves,
                "elements", elementsParCategorie,
                "total", membresTrouves.size() + elementsTrouves.size()
        );
    }
    private static String normaliser(String texte) {
        return java.text.Normalizer.normalize(texte, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(java.util.Locale.ROOT);
    }
    private static boolean correspond(String[] termes,String texte) {
        String contenu=normaliser(texte);
        return java.util.Arrays.stream(termes).allMatch(contenu::contains);
    }
}
