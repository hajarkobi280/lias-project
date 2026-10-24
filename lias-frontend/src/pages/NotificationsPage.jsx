import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

export default function NotificationsPage({ onUnreadChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [pending, setPending] = useState(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/notifications', { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setItems(data);
        setError('');
        onUnreadChange?.(data.filter(n => !n.lue).length);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Impossible de charger les notifications. Réessayez.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [refresh, onUnreadChange]);

  const actualiser = () => { setLoading(true); setRefresh(value => value + 1); };
  const marquerLue = async id => {
    setPending(id);
    try {
      await api.put(`/notifications/${id}/lue`);
      if (!mounted.current) return;
      setError('');
      setRefresh(value => value + 1);
    } catch {
      if (mounted.current) setError('La notification n’a pas pu être marquée comme lue. Réessayez.');
    } finally {
      if (mounted.current) setPending(null);
    }
  };

  return <section className="page" aria-busy={loading}>
    <div className="page-head">
      <div><p className="eyebrow">Communication</p><h1>Notifications</h1><p>Demandes, événements et documents récents.</p></div>
      <button className="primary" onClick={actualiser} disabled={loading}>Actualiser</button>
    </div>
    {error && <p className="notice" role="alert">{error}</p>}
    {loading && <p role="status">Chargement des notifications…</p>}
    <div className="cards">{items.map(n => <article className="card" key={n.id}>
      <div className="card-top"><span className={`badge ${n.lue ? 'muted' : ''}`}>{n.lue ? 'LUE' : 'NOUVELLE'}</span>
        {n.creeLe && <time dateTime={n.creeLe}>{new Date(n.creeLe).toLocaleString('fr-FR')}</time>}
      </div>
      <h2>{n.titre}</h2><p>{n.message}</p>
      {!n.lue && <div className="actions"><button disabled={pending === n.id} onClick={() => marquerLue(n.id)}>
        {pending === n.id ? 'Enregistrement…' : 'Marquer comme lue'}
      </button></div>}
    </article>)}</div>
    {!loading && !error && !items.length && <div className="empty">Aucune notification pour le moment.</div>}
  </section>;
}
