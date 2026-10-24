package com.lias.backend.service;

import com.lias.backend.model.Membre;
import com.lias.backend.model.Notification;
import com.lias.backend.model.RoleGouvernance;
import com.lias.backend.model.StatutMembre;
import com.lias.backend.repository.MembreRepository;
import com.lias.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Génération automatique des notifications (section 19) : événements,
 * validation de demandes (adhésion, besoins matériel), ajouts de documents.
 */
@Service
public class NotificationService {

    private final NotificationRepository notifications;
    private final MembreRepository membres;
    @org.springframework.beans.factory.annotation.Autowired private com.lias.backend.repository.MandatGouvernanceRepository mandats;

    public NotificationService(NotificationRepository notifications, MembreRepository membres) {
        this.notifications = notifications;
        this.membres = membres;
    }

    public void notifier(String destinataire, String titre, String message) {
        if (destinataire == null || destinataire.isBlank()) return;
        Notification n = new Notification();
        n.setDestinataire(destinataire);
        n.setTitre(titre);
        n.setMessage(message);
        notifications.save(n);
    }

    // Tous les membres avec un compte actif (ni retraité ni ancien)
    public void notifierTousActifs(String titre, String message) {
        List<Membre> actifs = membres.findAll().stream()
                .filter(m -> m.getStatutScientifique() != StatutMembre.RETRAITE && m.getStatutScientifique() != StatutMembre.ANCIEN)
                .toList();
        actifs.forEach(m -> notifier(m.getEmail(), titre, message));
    }

    // Le(s) directeur(s) / vice-directeur(s) en mandat — pour la validation des demandes
    public void notifierDirection(String titre, String message) {
        mandats.findAll().stream().filter(com.lias.backend.model.MandatGouvernance::estActif)
                .filter(m -> m.getRole() == RoleGouvernance.DIRECTEUR || m.getRole() == RoleGouvernance.VICE_DIRECTEUR)
                .map(com.lias.backend.model.MandatGouvernance::getMembre)
                .filter(m -> MembreService.actif(m.getStatutScientifique()))
                .map(Membre::getEmail).distinct().forEach(email -> notifier(email,titre,message));
    }
}
