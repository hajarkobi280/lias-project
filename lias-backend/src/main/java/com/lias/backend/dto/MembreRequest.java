package com.lias.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.lias.backend.model.StatutMembre;
import com.lias.backend.model.RoleGouvernance;
import java.time.LocalDate;

public class MembreRequest {
    private String nom;
    private String prenom;
    private String email;
    private String etablissementOrigine;

    // ✅ Accepte "centresInteret" ET "interetsRecherche" depuis React
    @JsonAlias("interetsRecherche")
    private String centresInteret;

    private String motDePasse;
    private String laboratoireOrigine;
    private String biographie;
    private String photoUrl;
    private LocalDate dateNaissance;
    private LocalDate dateEmbauche;
    private LocalDate dateAffiliation;

    // ✅ Accepte "statutScientifique" ET "statutInitial" depuis React
    @JsonAlias("statutScientifique")
    private StatutMembre statutInitial;

    // ✅ Accepte "roleGouvernance" ET "roleInitial" depuis React
    @JsonAlias("roleGouvernance")
    private RoleGouvernance roleInitial;

    // Getters et Setters — inchangés
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEtablissementOrigine() { return etablissementOrigine; }
    public void setEtablissementOrigine(String etablissementOrigine) { this.etablissementOrigine = etablissementOrigine; }

    public String getCentresInteret() { return centresInteret; }
    public void setCentresInteret(String centresInteret) { this.centresInteret = centresInteret; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    public String getLaboratoireOrigine() { return laboratoireOrigine; }
    public void setLaboratoireOrigine(String laboratoireOrigine) { this.laboratoireOrigine = laboratoireOrigine; }
    public String getBiographie() { return biographie; }
    public void setBiographie(String biographie) { this.biographie = biographie; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }
    public LocalDate getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDate dateEmbauche) { this.dateEmbauche = dateEmbauche; }
    public LocalDate getDateAffiliation() { return dateAffiliation; }
    public void setDateAffiliation(LocalDate dateAffiliation) { this.dateAffiliation = dateAffiliation; }

    public StatutMembre getStatutInitial() { return statutInitial; }
    public void setStatutInitial(StatutMembre statutInitial) { this.statutInitial = statutInitial; }

    public RoleGouvernance getRoleInitial() { return roleInitial; }
    public void setRoleInitial(RoleGouvernance roleInitial) { this.roleInitial = roleInitial; }

    private String equipeNom;
    public String getEquipeNom() { return equipeNom; }
    public void setEquipeNom(String equipeNom) { this.equipeNom = equipeNom; }
}
