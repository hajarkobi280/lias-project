package com.lias.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data @Entity
public class JournalActivite {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String type; private Long cibleId; private String action; private String auteur;
 private LocalDateTime date=LocalDateTime.now();
 @Column(columnDefinition="TEXT") private String contenu;
}
