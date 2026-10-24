package com.lias.backend.repository;
import com.lias.backend.model.Affiliation;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface AffiliationRepository extends JpaRepository<Affiliation,Long>{
 List<Affiliation> findByMembreIdOrderByDateDebutDesc(Long id);
 Optional<Affiliation> findByMembreIdAndDateFinIsNull(Long id);
}
