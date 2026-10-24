package com.lias.backend.config;

import com.lias.backend.model.Membre;
import com.lias.backend.repository.MembreRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MembreUserDetailsService implements UserDetailsService {
    private final MembreRepository membres;
    private final com.lias.backend.repository.MandatGouvernanceRepository mandats;
    public MembreUserDetailsService(MembreRepository membres, com.lias.backend.repository.MandatGouvernanceRepository mandats) { this.membres = membres; this.mandats = mandats; }

    @Override public UserDetails loadUserByUsername(String email) {
        Membre membre = membres.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Compte introuvable"));
        String role = membre.getRoleGouvernance() == com.lias.backend.model.RoleGouvernance.ADMIN ? "ADMIN" :
            mandats.findAllByMembreId(membre.getId()).stream().filter(com.lias.backend.model.MandatGouvernance::estActif)
            .max(java.util.Comparator.comparing(com.lias.backend.model.MandatGouvernance::getId))
            .map(m -> m.getRole().name()).orElse("MEMBRE_EQUIPE");
        boolean actif = membre.getStatutScientifique() == null ||
                (!"ANCIEN".equals(membre.getStatutScientifique().name()) && !"RETRAITE".equals(membre.getStatutScientifique().name()));
        String statut = membre.getStatutScientifique() == null ? "ASSOCIE" : membre.getStatutScientifique().name();
        return new User(membre.getEmail(), membre.getMotDePasse(), actif, true, true, actif,
                List.of(new SimpleGrantedAuthority("ROLE_" + role), new SimpleGrantedAuthority("STATUT_" + statut)));
    }
}
