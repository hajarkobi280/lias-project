package com.lias.backend.repository;
import com.lias.backend.model.Notification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification,Long>{List<Notification> findByDestinataireOrderByCreeLeDesc(String destinataire);}
