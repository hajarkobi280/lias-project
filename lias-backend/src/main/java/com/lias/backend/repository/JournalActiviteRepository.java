package com.lias.backend.repository;
import com.lias.backend.model.JournalActivite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface JournalActiviteRepository extends JpaRepository<JournalActivite,Long> {
 List<JournalActivite> findByTypeAndCibleIdOrderByDateDesc(String type,Long cibleId);
}
