package com.lias.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

// Distribution d'un matériel à un membre — traçabilité "qui a reçu quoi / qui n'a pas reçu" (section 14)
@Data
@Entity
@Table(name = "materiel_attribution")
public class MaterielAttribution {
 @Version private Long version;
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "materiel_item_id", nullable = false)
    private MaterielItem item;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    private int quantite = 1;
    private LocalDate dateAttribution = LocalDate.now();
    private boolean recu = false;
    private LocalDate dateReception;
}
