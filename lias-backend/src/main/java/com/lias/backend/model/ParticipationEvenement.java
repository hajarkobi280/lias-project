package com.lias.backend.model;
import jakarta.persistence.*;import lombok.Data;import java.time.LocalDateTime;
@Data @Entity @Table(uniqueConstraints=@UniqueConstraint(columnNames={"evenement_id","membre_id"}))
public class ParticipationEvenement {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private ElementLaboratoire evenement;
 @ManyToOne(optional=false) private Membre membre;
 private LocalDateTime inscriteLe=LocalDateTime.now();
}
