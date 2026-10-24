package com.lias.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "mandat_gouvernance")
public class MandatGouvernance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin; // Sera null tant que le mandat/rôle est actif

    @Column(name = "equipe_nom")
    private String equipeNom; // Optionnel (principalement pour le rôle CHEF_EQUIPE)

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleGouvernance role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membre_id", nullable = false)
    private Membre membre;

    @com.fasterxml.jackson.annotation.JsonIgnore
    public boolean estActif() {
        LocalDate today = LocalDate.now();
        return dateDebut != null && !dateDebut.isAfter(today) && (dateFin == null || dateFin.isAfter(today));
    }

    // Constructeur par défaut (Obligatoire pour JPA/Hibernate)
    public MandatGouvernance() {
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

    public String getEquipeNom() {
        return equipeNom;
    }

    public void setEquipeNom(String equipeNom) {
        this.equipeNom = equipeNom;
    }

    public RoleGouvernance getRole() {
        return role;
    }

    public void setRole(RoleGouvernance role) {
        this.role = role;
    }

    public Membre getMembre() {
        return membre;
    }

    public void setMembre(Membre membre) {
        this.membre = membre;
    }
}