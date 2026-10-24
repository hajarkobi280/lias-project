import api from './api';

const mandatService = {
  listerActifs: async () => (await api.get('/mandats/actifs')).data,
  listerTout: async () => (await api.get('/mandats')).data,
  attribuer: async (membreId, role, equipeNom, dateFin) => (await api.post('/mandats', null, { params: { membreId, role, equipeNom: equipeNom || undefined, dateFin: dateFin || undefined } })).data,
  cloturer: async (id) => (await api.put(`/mandats/${id}/cloturer`)).data,
};

export default mandatService;
