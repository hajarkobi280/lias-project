import api from './api';

const rechercheService = {
  rechercher: async (q) => (await api.get('/recherche', { params: { q } })).data,
};

export default rechercheService;
