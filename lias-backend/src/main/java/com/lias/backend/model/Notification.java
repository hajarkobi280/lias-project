package com.lias.backend.model;
import jakarta.persistence.*; import lombok.Data; import java.time.LocalDateTime;
@Data @Entity public class Notification { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; private String destinataire; private String titre; @Column(columnDefinition="TEXT") private String message; private boolean lue=false; private LocalDateTime creeLe=LocalDateTime.now(); }
