package com.lias.backend.repository;

import com.lias.backend.model.ElementLaboratoire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ElementLaboratoireRepository extends JpaRepository<ElementLaboratoire, Long> {
    List<ElementLaboratoire> findByCategorieOrderByDateDebutDesc(String categorie);
    List<ElementLaboratoire> findByTitreContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String titre, String description);
}
