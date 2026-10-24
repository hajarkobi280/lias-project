package com.lias.backend.service;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lias.backend.model.JournalActivite;
import com.lias.backend.repository.JournalActiviteRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
@Service
public class JournalService {
 private final JournalActiviteRepository repo; private final ObjectMapper mapper;
 public JournalService(JournalActiviteRepository repo,ObjectMapper mapper){this.repo=repo;this.mapper=mapper;}
 public void enregistrer(String type,Long id,String action,Object contenu){
  JournalActivite e=new JournalActivite();e.setType(type);e.setCibleId(id);e.setAction(action);
  var auth=SecurityContextHolder.getContext().getAuthentication();e.setAuteur(auth==null?"SYSTEME":auth.getName());
  try{e.setContenu(mapper.writeValueAsString(contenu));}catch(JsonProcessingException ex){throw new IllegalStateException("Historisation impossible",ex);}
  repo.save(e);
 }
}
