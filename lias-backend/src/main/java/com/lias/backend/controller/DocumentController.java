package com.lias.backend.controller;
import com.lias.backend.model.FichierDocument;
import com.lias.backend.repository.*;
import com.lias.backend.config.AccessPolicy;
import org.springframework.core.io.*;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.*;import java.util.*;
@RestController @RequestMapping("/api/documents") public class DocumentController {
 private final Path stockage;private final FichierDocumentRepository fichiers;private final ElementLaboratoireRepository elements;private final AccessPolicy policy;
 @org.springframework.beans.factory.annotation.Autowired private JournalActiviteRepository journal;
 @org.springframework.beans.factory.annotation.Autowired private com.fasterxml.jackson.databind.ObjectMapper mapper;
 public DocumentController(@Value("${lias.upload-dir:uploads}") String dir,FichierDocumentRepository fichiers,ElementLaboratoireRepository elements,AccessPolicy policy){stockage=Paths.get(dir).toAbsolutePath().normalize();this.fichiers=fichiers;this.elements=elements;this.policy=policy;}
 @PostMapping("/upload") public Map<String,String> upload(@RequestParam MultipartFile fichier,Authentication a)throws Exception{return stocker(fichier,a.getName(),false);}
 @PostMapping("/candidature") public Map<String,String> candidature(@RequestParam MultipartFile fichier)throws Exception{return stocker(fichier,null,true);}
 private Map<String,String> stocker(MultipartFile f,String owner,boolean candidature)throws Exception{
  if(f.isEmpty()||f.getSize()>10*1024*1024)throw new IllegalArgumentException("Fichier vide ou supérieur à 10 Mo");
  String original=Objects.requireNonNullElse(f.getOriginalFilename(),"document").replaceAll("[^a-zA-Z0-9._-]","_");
  String ext=original.contains(".")?original.substring(original.lastIndexOf('.')).toLowerCase(Locale.ROOT):"";
  if(!(candidature?Set.of(".pdf"):Set.of(".pdf",".docx",".xlsx",".png",".jpg",".jpeg",".txt")).contains(ext))throw new IllegalArgumentException("Format non autorisé (CV : PDF uniquement)");
  String nom=UUID.randomUUID()+ext;Files.createDirectories(stockage);
  try(var in=f.getInputStream()){Files.copy(in,stockage.resolve(nom));}
  FichierDocument d=new FichierDocument();d.setNom(nom);d.setOriginal(original);d.setProprietaire(owner);d.setCandidature(candidature);fichiers.save(d);
  return Map.of("nom",original,"url","/api/documents/fichier/"+nom);
 }
 @GetMapping("/publications/{nom:.+}") public ResponseEntity<Resource> publicationPublique(@PathVariable String nom)throws Exception{
  FichierDocument d=fichiers.findById(nom).orElseThrow();
  boolean publicActuel=!d.isCandidature()&&elements.findAll().stream().anyMatch(e->"PUBLICATIONS".equals(e.getCategorie())&&!"ARCHIVE".equals(e.getStatut())&&("/api/documents/fichier/"+nom).equals(e.getDocumentUrl()));
  if(!publicActuel)return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
  return fichier(nom,d);
 }
 @GetMapping("/fichier/{nom:.+}") public ResponseEntity<Resource> telecharger(@PathVariable String nom,Authentication a)throws Exception{
  FichierDocument d=fichiers.findById(nom).orElse(null);
  boolean permitted=policy.isDirecteur(a);
  if(d!=null){
   permitted=permitted||a.getName().equals(d.getProprietaire());
   if(!d.isCandidature())permitted=permitted||elements.findAll().stream().anyMatch(e->("/api/documents/fichier/"+nom).equals(e.getDocumentUrl())&&policy.canRead(a,e.getCategorie()));
  }
  if(!permitted && d!=null && !d.isCandidature())permitted=journal.findAll().stream().filter(h->"ELEMENT".equals(h.getType())).anyMatch(h->{try{var e=mapper.readTree(h.getContenu());return ("/api/documents/fichier/"+nom).equals(e.path("documentUrl").asText())&&policy.canRead(a,e.path("categorie").asText());}catch(Exception ex){return false;}});
  if(!permitted)throw new AccessDeniedException("Document privé");
  return fichier(nom,d);
 }
 private ResponseEntity<Resource> fichier(String nom,FichierDocument d)throws Exception{
  Path f=stockage.resolve(nom).normalize();if(!f.startsWith(stockage)||!Files.isRegularFile(f))return ResponseEntity.notFound().build();
  return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(d==null?nom:d.getOriginal()).build().toString()).body(new UrlResource(f.toUri()));
 }
}
