package com.lias.backend.repository;

import com.lias.backend.model.MandatGouvernance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MandatGouvernanceRepository extends JpaRepository<MandatGouvernance, Long> {
    Optional<MandatGouvernance> findByMembreIdAndDateFinIsNull(Long membreId);
    List<MandatGouvernance> findAllByMembreId(Long membreId);
}