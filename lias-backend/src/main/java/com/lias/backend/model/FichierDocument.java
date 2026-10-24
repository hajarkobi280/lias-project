package com.lias.backend.model;
import jakarta.persistence.*;import lombok.Data;
@Data @Entity public class FichierDocument {
 @Id private String nom; private String original; private String proprietaire; private boolean candidature;
}
