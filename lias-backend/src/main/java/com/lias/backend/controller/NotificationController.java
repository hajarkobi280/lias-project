package com.lias.backend.controller;
import com.lias.backend.model.Notification;import com.lias.backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;import org.springframework.security.core.Authentication;import org.springframework.security.access.AccessDeniedException;import java.util.*;
@RestController @RequestMapping("/api/notifications") public class NotificationController {
 private final NotificationRepository repo;public NotificationController(NotificationRepository repo){this.repo=repo;}
 @GetMapping public List<Notification> mesNotifications(Authentication a){return repo.findByDestinataireOrderByCreeLeDesc(a.getName());}
 @PutMapping("/{id}/lue") public Notification lire(@PathVariable Long id,Authentication a){
  Notification n=repo.findById(id).orElseThrow();if(!n.getDestinataire().equalsIgnoreCase(a.getName()))throw new AccessDeniedException("Notification privée");
  n.setLue(true);return repo.save(n);
 }
}
