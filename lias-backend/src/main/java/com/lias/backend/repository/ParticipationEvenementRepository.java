package com.lias.backend.repository;
import com.lias.backend.model.ParticipationEvenement;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface ParticipationEvenementRepository extends JpaRepository<ParticipationEvenement,Long>{
 List<ParticipationEvenement> findByEvenementId(Long id);
 Optional<ParticipationEvenement> findByEvenementIdAndMembreId(Long evenementId,Long membreId);
}
