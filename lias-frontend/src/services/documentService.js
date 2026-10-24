import api from './api';
export async function uploadDocument(file, candidature = false) {
 const data = new FormData(); data.append('fichier', file);
 return (await api.post(candidature ? '/documents/candidature' : '/documents/upload', data)).data;
}
export async function ouvrirDocument(url) {
 if (!url) return;
 if (!url.startsWith('/api/documents/fichier/')) {
  if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
  return;
 }
 const response = await api.get(url.substring(4), { responseType: 'blob' });
 const blobUrl = URL.createObjectURL(response.data);
 const a = document.createElement('a'); a.href = blobUrl; a.download = url.split('/').pop(); a.click();
 setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
