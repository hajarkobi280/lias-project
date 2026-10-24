package com.lias.backend.controller;

import com.lias.backend.model.ElementLaboratoire;
import com.lias.backend.model.MandatGouvernance;
import com.lias.backend.model.Membre;
import com.lias.backend.model.RoleGouvernance;
import com.lias.backend.repository.ElementLaboratoireRepository;
import com.lias.backend.repository.MandatGouvernanceRepository;
import com.lias.backend.repository.MembreRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

/** Consultation publique limitée aux activités, publications, équipes (section 2.1). */
@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final ElementLaboratoireRepository elements;
    private final MembreRepository membres;
    private final MandatGouvernanceRepository mandats;

    public PublicController(ElementLaboratoireRepository elements, MembreRepository membres, MandatGouvernanceRepository mandats) {
        this.elements = elements;
        this.membres = membres;
        this.mandats = mandats;
    }

    @GetMapping("/contenus")
    public List<ElementLaboratoire> contenus(@RequestParam String categorie) {
        if (!Set.of("EQUIPES", "EVENEMENTS", "PUBLICATIONS").contains(categorie)) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN,"Contenu privé");
        return elements.findByCategorieOrderByDateDebutDesc(categorie).stream()
                .filter(element -> !"ARCHIVE".equals(element.getStatut())).toList();
    }

    // Liste publique des équipes (section 2.1) : nom, effectif, chef d'équipe en mandat
    @GetMapping("/equipes")
    public List<Map<String, Object>> equipes() {
        List<Membre> tous = membres.findAll().stream().filter(m -> com.lias.backend.service.MembreService.actif(m.getStatutScientifique())).toList();
        Set<String> nomsEquipes = tous.stream()
                .map(Membre::getEquipeNom)
                .filter(nom -> nom != null && !nom.isBlank())
                .collect(Collectors.toCollection(TreeSet::new));

        elements.findByCategorieOrderByDateDebutDesc("EQUIPES").stream().filter(e -> !"ARCHIVE".equals(e.getStatut())).forEach(e -> nomsEquipes.add(e.getTitre()));
        List<MandatGouvernance> mandatsActifsChefs = mandats.findAll().stream()
                .filter(m -> m.estActif() && m.getRole() == RoleGouvernance.CHEF_EQUIPE)
                .toList();

        return nomsEquipes.stream().map(nom -> {
            long effectif = tous.stream().filter(m -> nom.equals(m.getEquipeNom())).count();
            String chef = mandatsActifsChefs.stream()
                    .filter(m -> nom.equals(m.getEquipeNom()))
                    .findFirst()
                    .map(m -> m.getMembre().getPrenom() + " " + m.getMembre().getNom())
                    .orElse(null);
            Map<String, Object> equipe = new LinkedHashMap<>();
            equipe.put("nom", nom);
            equipe.put("effectif", effectif);
            equipe.put("chefEquipe", chef);
            equipe.put("membres", tous.stream().filter(m -> nom.equals(m.getEquipeNom()))
                    .map(m -> m.getPrenom() + " " + m.getNom())
                    .sorted(String.CASE_INSENSITIVE_ORDER).toList());
            return equipe;
        }).toList();
    }
}
