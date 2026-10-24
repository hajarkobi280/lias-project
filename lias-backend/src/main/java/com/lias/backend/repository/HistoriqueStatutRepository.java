package com.lias.backend.repository;

import com.lias.backend.model.HistoriqueStatut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoriqueStatutRepository extends JpaRepository<HistoriqueStatut, Long> {
    Optional<HistoriqueStatut> findByMembreIdAndDateFinIsNull(Long membreId);

    List<HistoriqueStatut> findAllByMembreId(Long membreId);
}