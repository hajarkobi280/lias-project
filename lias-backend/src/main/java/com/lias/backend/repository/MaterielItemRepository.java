package com.lias.backend.repository;
import com.lias.backend.model.MaterielItem;import org.springframework.data.jpa.repository.*;import org.springframework.data.repository.query.Param;import jakarta.persistence.LockModeType;import java.util.Optional;
public interface MaterielItemRepository extends JpaRepository<MaterielItem,Long>{
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select i from MaterielItem i where i.id=:id") Optional<MaterielItem> verrouiller(@Param("id") Long id);
}
