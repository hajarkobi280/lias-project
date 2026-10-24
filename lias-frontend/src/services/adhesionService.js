import api from './api';

const adhesionService = {
  // Soumission publique — pas besoin d'être connecté
  soumettre: async (data) => (await api.post('/adhesions/public', data)).data,
  // Liste des demandes — réservé au directeur
  lister: async () => (await api.get('/adhesions')).data,
  // Acceptation / refus d'une demande — réservé au directeur
  decider: async (id, accepter) => (await api.put(`/adhesions/${id}/decision`, null, { params: { accepter } })).data, // { demande, membre: 'cree' | 'deja_existant' | 'non_concerne' }
};

export default adhesionService;
