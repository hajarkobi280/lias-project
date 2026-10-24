package com.lias.backend.repository;

import com.lias.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByFilOrderByCreeLeAsc(String fil);

    // Fils distincts déjà utilisés, pour proposer une liste aux membres (équipes, événements...)
    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT m.fil FROM Message m")
    List<String> findDistinctFils();
}
