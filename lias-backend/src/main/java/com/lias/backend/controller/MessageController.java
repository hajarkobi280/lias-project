package com.lias.backend.controller;

import com.lias.backend.model.Membre;
import com.lias.backend.model.Message;
import com.lias.backend.repository.MembreRepository;
import com.lias.backend.repository.MessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messages;
    private final MembreRepository membres;

    public MessageController(MessageRepository messages, MembreRepository membres) {
        this.messages = messages;
        this.membres = membres;
    }

    // Liste des fils déjà utilisés (équipes, événements, général)
    @GetMapping("/fils")
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public List<String> fils() {
        return messages.findDistinctFils();
    }

    @GetMapping
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public List<Message> lister(@RequestParam String fil) {
        return messages.findByFilOrderByCreeLeAsc(fil);
    }

    @PostMapping
    @PreAuthorize("@accessPolicy.accesInterne(authentication)")
    public ResponseEntity<Message> poster(@RequestBody Map<String, String> body, Authentication authentication) {
        if(body.get("fil")==null||body.get("fil").isBlank()||body.get("contenu")==null||body.get("contenu").isBlank())throw new IllegalArgumentException("Fil et message obligatoires");
        Membre auteur = membres.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Membre introuvable"));
        Message message = new Message();
        message.setFil(body.get("fil"));
        message.setContenu(body.get("contenu"));
        message.setAuteur(auteur);
        return ResponseEntity.ok(messages.save(message));
    }
}
