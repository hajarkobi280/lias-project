import { useState } from 'react';
import rechercheService from '../services/rechercheService';

const libelleCategorie = (c) => ({
  EVENEMENTS: 'Événements', PUBLICATIONS: 'Publications', DOCUMENTS: 'Documents',
  CONVENTIONS: 'Conventions', PV: 'Réunions & PV', MATERIEL: 'Matériel',
  EQUIPES: 'Équipes', DISCUSSIONS: 'Discussions',
}[c] || c);

export default function RecherchePage() {
  const [q, setQ] = useState('');
  const [resultats, setResultats] = useState(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState('');
  const [terme, setTerme] = useState('');

  const lancer = async (event) => {
    event.preventDefault();
    if (!q.trim()) return;
    setRecherche(true);setErreur('');setResultats(null);setTerme(q.trim());
    try { setResultats(await rechercheService.rechercher(q.trim())); } catch { setErreur('La recherche a échoué. Réessayez.'); } finally {setRecherche(false);}
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Module LIAS</p>
          <h1>Recherche globale</h1>
          <p>Membres, documents, événements, publications — en une seule recherche.</p>
        </div>
      </div>
      <form className="global-search-form" onSubmit={lancer}>
        <input className="search" aria-label="Recherche globale" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, un titre, un mot-clé..." />
        <button className="primary" type="submit" disabled={recherche || !q.trim()}>{recherche ? "Recherche…" : "Rechercher"}</button>
      </form>
      {erreur && <p className="notice" role="alert">{erreur}</p>}
      {recherche && <p role="status">Recherche en cours…</p>}

      {resultats && (
        <>
          <p className="notice">{resultats.total} résultat(s) pour « {terme} ».</p>

          {resultats.membres?.length > 0 && (
            <>
              <h2>Membres</h2>
              <div className="cards">
                {resultats.membres.map((m) => (
                  <article className="card" key={`membre-${m.id}`}>
                    <span className="badge">{m.statutScientifique}</span>
                    <h2>{m.prenom} {m.nom}</h2>
                    <p>{m.email}</p>
                  </article>
                ))}
              </div>
            </>
          )}

          {Object.entries(resultats.elements || {}).map(([categorie, items]) => (
            <div key={categorie}>
              <h2>{libelleCategorie(categorie)}</h2>
              <div className="cards">
                {items.map((item) => (
                  <article className="card" key={`${categorie}-${item.id}`}>
                    <span className={`badge ${item.statut === 'ARCHIVE' ? 'muted' : ''}`}>{item.statut || 'ACTIF'}</span>
                    <h2>{item.titre}</h2>
                    <p>{item.description || 'Aucune description.'}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}

          {!resultats.membres?.length && !Object.keys(resultats.elements || {}).length && (
            <div className="empty">Aucun résultat.</div>
          )}
        </>
      )}
    </section>
  );
}
