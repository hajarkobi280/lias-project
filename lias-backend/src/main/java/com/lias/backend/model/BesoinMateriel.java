package com.lias.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

// Demande de besoin en matériel (section 15) — soumission puis validation par la direction
@Data
@Entity
@Table(name = "besoin_materiel")
public class BesoinMateriel {
 @Version private Long version;
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "demandeur_id", nullable = false)
    private Membre demandeur;

    @Column(nullable = false)
    private String designation;
    @Column(columnDefinition = "TEXT")
    private String justification;

    private String statut = "EN_ATTENTE"; // EN_ATTENTE, VALIDEE, REFUSEE
    private LocalDate dateDemande = LocalDate.now();
    private LocalDate dateDecision;
}
