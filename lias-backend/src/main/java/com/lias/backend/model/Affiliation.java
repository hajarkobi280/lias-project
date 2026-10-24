package com.lias.backend.model;
import jakarta.persistence.*;import lombok.Data;import java.time.LocalDate;
@Data @Entity public class Affiliation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Membre membre;
 private LocalDate dateDebut; private LocalDate dateFin;
}
