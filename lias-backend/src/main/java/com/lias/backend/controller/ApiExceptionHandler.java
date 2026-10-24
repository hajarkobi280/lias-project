package com.lias.backend.controller;
import org.springframework.web.bind.annotation.*;import org.springframework.http.*;import org.springframework.dao.DataIntegrityViolationException;import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(NoSuchElementException.class) public ResponseEntity<?> absent(NoSuchElementException e){return ResponseEntity.status(404).body(Map.of("message","Ressource introuvable"));}
 @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<?> invalide(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));}
 @ExceptionHandler(IllegalStateException.class) public ResponseEntity<?> conflit(IllegalStateException e){return ResponseEntity.status(409).body(Map.of("message",e.getMessage()));}
 @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class) public ResponseEntity<?> concurrent(Exception e){return ResponseEntity.status(409).body(Map.of("message","Une autre personne a modifié cette demande. Actualisez la page."));}
 @ExceptionHandler(DataIntegrityViolationException.class) public ResponseEntity<?> doublon(DataIntegrityViolationException e){return ResponseEntity.status(409).body(Map.of("message","Ces informations existent déjà ou sont incomplètes."));}
}
