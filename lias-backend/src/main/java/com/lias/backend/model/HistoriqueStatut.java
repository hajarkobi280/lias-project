package com.lias.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "historique_statut")
public class HistoriqueStatut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin; // Sera null tant que le statut est actif

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutMembre statut;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    // Constructeur par défaut (Obligatoire pour JPA/Hibernate)
    public HistoriqueStatut() {
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public StatutMembre getStatut() {
        return statut;
    }

    public void setStatut(StatutMembre statut) {
        this.statut = statut;
    }

    public Membre getMembre() {
        return membre;
    }

    public void setMembre(Membre membre) {
        this.membre = membre;
    }
}