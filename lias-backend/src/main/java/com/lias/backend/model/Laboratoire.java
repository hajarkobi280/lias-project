package com.lias.backend.model;
import jakarta.persistence.*;import lombok.Data;import java.time.LocalDate;
@Data @Entity public class Laboratoire {
 @Id private Long id=1L;private String nom="LIAS";private LocalDate dateCreation;
 @Column(columnDefinition="TEXT") private String presentation="Laboratoire d’Intelligence Artificielle et Systèmes — Faculté des Sciences Ben M’Sik, Casablanca.";
}
