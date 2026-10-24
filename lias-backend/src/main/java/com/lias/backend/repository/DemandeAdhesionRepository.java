package com.lias.backend.repository;
import com.lias.backend.model.DemandeAdhesion;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DemandeAdhesionRepository extends JpaRepository<DemandeAdhesion,Long> {
 boolean existsByEmailAndStatut(String email,String statut);
}
