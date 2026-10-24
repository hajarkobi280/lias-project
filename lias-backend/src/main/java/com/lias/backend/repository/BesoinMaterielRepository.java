package com.lias.backend.repository;
import com.lias.backend.model.BesoinMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BesoinMaterielRepository extends JpaRepository<BesoinMateriel, Long> {
    List<BesoinMateriel> findByDemandeurId(Long demandeurId);
}
