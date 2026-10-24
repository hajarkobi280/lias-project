package com.lias.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data @Entity
public class DemandeAdhesion {
 @Version private Long version;
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String nom; @Column(nullable=false) private String prenom;
 @Column(nullable=false) private String email;
 @Column(columnDefinition="TEXT") private String motivation;
 @com.fasterxml.jackson.annotation.JsonProperty(access=com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
 private String motDePasse;
 @com.fasterxml.jackson.annotation.JsonProperty(access=com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
 private String suiviToken;
 private String etablissementOrigine; private String laboratoireOrigine;
 private String decisionPar;
 private String cvUrl; private String statut="EN_ATTENTE";
 private LocalDateTime creeLe=LocalDateTime.now(); private LocalDateTime traiteLe;
}
