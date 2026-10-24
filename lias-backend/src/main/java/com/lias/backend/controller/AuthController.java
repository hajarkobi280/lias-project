package com.lias.backend.controller;

import com.lias.backend.config.JwtUtil;
import com.lias.backend.model.Membre;
import com.lias.backend.repository.MembreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private MembreRepository membreRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired private com.lias.backend.config.MembreUserDetailsService details;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String motDePasse = body.get("motDePasse");

        if (email == null || motDePasse == null) return ResponseEntity.badRequest().body(Map.of("message", "Identifiants obligatoires"));
        email = email.trim().toLowerCase(java.util.Locale.ROOT);
        Optional<Membre> membreOpt = membreRepository.findByEmail(email);

        if (membreOpt.isEmpty()) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Email introuvable"));
        }

        Membre membre = membreOpt.get();

        if (membre.getStatutScientifique() == com.lias.backend.model.StatutMembre.ANCIEN ||
                membre.getStatutScientifique() == com.lias.backend.model.StatutMembre.RETRAITE) {
            return ResponseEntity.status(403).body(Map.of("message", "Ce compte est désactivé ou gelé"));
        }

        // Vérification du mot de passe via le hash BCrypt stocké en base
        if (!passwordEncoder.matches(motDePasse, membre.getMotDePasse())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Mot de passe incorrect"));
        }

        String role = details.loadUserByUsername(email).getAuthorities().stream().map(a -> a.getAuthority()).filter(a -> a.startsWith("ROLE_")).findFirst().orElse("ROLE_MEMBRE_EQUIPE").substring(5);

        String token = jwtUtil.generateToken(email, role);

        return ResponseEntity.ok(Map.of(
                "photoUrl", membre.getPhotoUrl() == null ? "" : membre.getPhotoUrl(),
                "id", membre.getId(),
                "token", token,
                "email", email,
                "nom", membre.getNom(),
                "prenom", membre.getPrenom(),
                "role", role,
                "statut", membre.getStatutScientifique() == null ? "ASSOCIE" : membre.getStatutScientifique().name()
        ));
    }
    @GetMapping("/me") public Map<String,Object> moi(org.springframework.security.core.Authentication a){
        Membre m=membreRepository.findByEmail(a.getName()).orElseThrow();
        String role=a.getAuthorities().stream().map(x->x.getAuthority()).filter(x->x.startsWith("ROLE_")).findFirst().orElse("ROLE_MEMBRE_EQUIPE").substring(5);
        return Map.of("photoUrl",m.getPhotoUrl()==null?"":m.getPhotoUrl(),"id",m.getId(),"nom",m.getNom(),"prenom",m.getPrenom(),"email",m.getEmail(),"role",role,"statut",m.getStatutScientifique()==null?"ASSOCIE":m.getStatutScientifique().name());
    }
}
