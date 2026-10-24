-- À appliquer aux bases existantes : conserve les photos et liens déjà enregistrés.
USE lias_db;
ALTER TABLE membre MODIFY COLUMN photo_url TEXT;
