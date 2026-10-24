package com.lias.backend.service;
import com.lias.backend.model.RapportAnnuel;import com.lias.backend.repository.*;import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;import org.springframework.scheduling.annotation.*;import org.springframework.transaction.annotation.Transactional;
import java.time.*;import java.util.*;
@Service @EnableScheduling public class RapportAnnuelService {
 private final ElementLaboratoireRepository elements;private final RapportAnnuelRepository rapports;private final ObjectMapper mapper;
 public RapportAnnuelService(ElementLaboratoireRepository elements,RapportAnnuelRepository rapports,ObjectMapper mapper){this.elements=elements;this.rapports=rapports;this.mapper=mapper;}
 public Map<String,Object> calculer(int annee){
  if(annee<1900||annee>2100)throw new IllegalArgumentException("Année invalide");
  var details=elements.findAll().stream().filter(e->e.getDateDebut()!=null&&e.getDateDebut().getYear()==annee).toList();
  Map<String,Long> comptes=new TreeMap<>();details.forEach(e->comptes.merge(e.getCategorie(),1L,Long::sum));
  return Map.of("annee",annee,"activites",comptes,"details",details,"genereLe",LocalDateTime.now().toString());
 }
 // Exécution quotidienne : rattrape une clôture annuelle si le serveur était arrêté le 1er janvier.
 @Scheduled(cron="0 0 2 * * *",zone="Africa/Casablanca") @Transactional
 public void cloturerAnnees(){
  var annees=elements.findAll().stream().filter(e->e.getDateDebut()!=null&&e.getDateDebut().getYear()<LocalDate.now().getYear()).map(e->e.getDateDebut().getYear()).collect(java.util.stream.Collectors.toSet());
  annees.add(LocalDate.now().getYear()-1);
  for(int annee:annees)if(!rapports.existsById(annee)){
   RapportAnnuel r=new RapportAnnuel();r.setAnnee(annee);r.setGenereLe(LocalDateTime.now());
   try{r.setContenu(mapper.writeValueAsString(calculer(annee)));}catch(Exception e){throw new IllegalStateException("Rapport impossible",e);}
   rapports.save(r);
  }
 }
}
