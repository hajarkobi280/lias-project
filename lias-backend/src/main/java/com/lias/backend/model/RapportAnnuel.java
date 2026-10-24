package com.lias.backend.model;
import jakarta.persistence.*;import lombok.Data;import java.time.LocalDateTime;
@Data @Entity public class RapportAnnuel {
 @Id private Integer annee; private LocalDateTime genereLe;
 @Lob private String contenu;
}
