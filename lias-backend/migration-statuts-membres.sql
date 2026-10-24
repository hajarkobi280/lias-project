USE lias_db;
ALTER TABLE membre MODIFY COLUMN statut_actuel ENUM('ASSOCIE','DOCTORANT','PERMANENT','RETRAITE','ANCIEN','ANCIEN_MEMBRE');
ALTER TABLE historique_statut MODIFY COLUMN statut ENUM('ASSOCIE','DOCTORANT','PERMANENT','RETRAITE','ANCIEN','ANCIEN_MEMBRE');
-- Harmonisation du nom, sans supprimer les périodes historiques.
UPDATE membre SET statut_actuel='ANCIEN' WHERE statut_actuel='ANCIEN_MEMBRE';
UPDATE historique_statut SET statut='ANCIEN' WHERE statut='ANCIEN_MEMBRE';
