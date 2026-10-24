package com.lias.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Message dans un fil de discussion interne. Un fil regroupe les messages
 * d'une équipe, d'un événement, ou de la discussion générale du laboratoire.
 */
@Data
@Entity
@Table(name = "message")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ex: "GENERAL", "EQUIPE:IA", "EVENEMENT:12"
    @Column(nullable = false, length = 80)
    private String fil;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "auteur_id", nullable = false)
    private Membre auteur;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creeLe = LocalDateTime.now();
}
