package com.lias.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

// Un arrivage de matériel (section 14)
@Data
@Entity
@Table(name = "materiel_item")
public class MaterielItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nom;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false)
    private int quantiteTotal;
    private LocalDate dateArrivage = LocalDate.now();
}
