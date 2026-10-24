package com.lias.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "membre")
public class Membre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nom;

    @Column(nullable = false, length = 50)
    private String prenom;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private String motDePasse;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private LocalDate dateAffiliation;

    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String biographie;

    private String etablissementOrigine;
    private String laboratoireOrigine;

    @Column(columnDefinition = "TEXT")
    private String centresInteret;

    // ✅ AJOUT — Statut et rôle courants (dénormalisés pour simplifier l'API React)
    // Ces champs reflètent le statut/rôle actif sans avoir à joindre les historiques
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_actuel")
    private StatutMembre statutScientifique;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_actuel")
    private RoleGouvernance roleGouvernance;

    // Équipe actuelle du membre (section 3) — distincte de l'equipeNom du mandat
    // d'un chef d'équipe, tout membre peut appartenir à une équipe.
    private String equipeNom;
}
