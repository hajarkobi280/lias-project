import api from './api';

const materielService = {
  listerArrivages: async () => (await api.get('/materiel')).data,
  creerArrivage: async (data) => (await api.post('/materiel', data)).data,
  attribuer: async (itemId, membreId, quantite) => (await api.post(`/materiel/${itemId}/attribuer`, null, { params: { membreId, quantite } })).data,
  confirmerReception: async (attributionId) => (await api.put(`/materiel/attributions/${attributionId}/recu`)).data,
  listerAttributions: async (recu) => (await api.get('/materiel/attributions', { params: recu === undefined ? {} : { recu } })).data,

  soumettreBesoin: async (data) => (await api.post('/besoins-materiel', data)).data,
  listerBesoins: async () => (await api.get('/besoins-materiel')).data,
  mesBesoins: async () => (await api.get('/besoins-materiel/mes-demandes')).data,
  deciderBesoin: async (id, valider) => (await api.put(`/besoins-materiel/${id}/decision`, null, { params: { valider } })).data,
};

export default materielService;
