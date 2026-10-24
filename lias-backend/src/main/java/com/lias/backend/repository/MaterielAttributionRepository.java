package com.lias.backend.repository;
import com.lias.backend.model.MaterielAttribution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface MaterielAttributionRepository extends JpaRepository<MaterielAttribution, Long> {
    List<MaterielAttribution> findByMembreId(Long membreId);
    List<MaterielAttribution> findByRecu(boolean recu);
}
