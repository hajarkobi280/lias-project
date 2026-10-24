import api from './api';
const elements = {
  list: async (categorie, q) => (await api.get('/elements', { params: { categorie, q } })).data,
  create: async (data) => (await api.post('/elements', data)).data,
  update: async (id, data) => (await api.put(`/elements/${id}`, data)).data,
  archive: async (id) => api.delete(`/elements/${id}`),
  annualReport: async (year) => (await api.get(`/elements/rapport-annuel/${year}`)).data,
};
export default elements;
