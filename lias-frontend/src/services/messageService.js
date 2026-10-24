import api from './api';

const messageService = {
  fils: async () => (await api.get('/messages/fils')).data,
  lister: async (fil) => (await api.get('/messages', { params: { fil } })).data,
  poster: async (fil, contenu) => (await api.post('/messages', { fil, contenu })).data,
};

export default messageService;
