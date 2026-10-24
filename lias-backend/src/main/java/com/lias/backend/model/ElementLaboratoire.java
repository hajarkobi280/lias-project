package com.lias.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Registre transversal du laboratoire. Une même structure permet d'archiver
 * les événements, publications, documents, demandes, équipements, conventions et PV.
 */
@Data
@Entity
@Table(name = "element_laboratoire")
public class ElementLaboratoire {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 40)
    private String categorie;
    private String creePar;
    @Column(nullable = false)
    private String titre;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String statut;
    private String responsable;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String documentUrl;
    @Column(columnDefinition = "TEXT")
    private String metadata;
    @Column(nullable = false, updatable = false)
    private LocalDateTime creeLe = LocalDateTime.now();
}
