import api from './api';

const API_URL = '/membres';

const membreService = {
    // 1. Récupérer tous les chercheurs
    getMembres: async () => {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Erreur GET membres :", error);
            throw new Error("Impossible de charger les membres", { cause: error });
        }
    },

    // 2. Créer un nouveau chercheur
    createMembre: async (membreData) => {
        try {
            const response = await api.post(API_URL, membreData);
            return response.data;
        } catch (error) {
            // Extraction du message d'erreur renvoyé par Spring Boot s'il existe
            const serveurMessage = error.response?.data?.message || "Erreur lors de la création du membre sur l'API";
            console.error("Détails de l'erreur du serveur Backend (POST) :", error.response?.data || error);
            
            // Correction : On passe la cause réelle pour préserver l'erreur d'origine
            throw new Error(serveurMessage, { cause: error });
        }
    },

    // 3. Mettre à jour un chercheur existant
    updateMembre: async (id, membreData) => {
        try {
            const response = await api.put(`${API_URL}/${id}`, membreData);
            return response.data;
        } catch (error) {
            const serveurMessage = error.response?.data?.message || "Erreur lors de la mise à jour du membre sur l'API";
            console.error("Détails de l'erreur du serveur Backend (PUT) :", error.response?.data || error);
            
            // Correction : On lie l'erreur capturée à la cause
            throw new Error(serveurMessage, { cause: error });
        }
    },

    // 4. Supprimer un chercheur
    deleteMembre: async (id) => {
        try {
            const response = await api.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw new Error("Erreur lors de la suppression du membre", { cause: error });
        }
    },

    // 5. Modifier son propre profil (aucun droit de gestion requis)
    modifierMonProfil: async (data) => {
        try {
            const response = await api.put(`${API_URL}/mon-profil`, data);
            return response.data;
        } catch (error) {
            throw new Error("Erreur lors de la mise à jour de votre profil", { cause: error });
        }
    },

    // 6. Historique des affiliations/statuts d'un membre (section 4.3)
    getHistorique: async (membreId) => {
        try {
            const response = await api.get(`/historique-statuts/membre/${membreId}`);
            return response.data;
        } catch (error) {
            throw new Error("Impossible de charger l'historique", { cause: error });
        }
    }
};

export default membreService;
