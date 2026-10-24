import { useCallback, useEffect, useState } from 'react';
import adhesionService from '../services/adhesionService';
import { ouvrirDocument } from '../services/documentService';

export default function AdhesionsPage({ isDirecteur }) {
  const [demandes, setDemandes] = useState([]);
  const [message, setMessage] = useState('');

  const load = useCallback(() => adhesionService.lister().then(setDemandes).catch(() => setMessage('Impossible de charger les candidatures.')), []);
  useEffect(() => { if(isDirecteur)load(); }, [load,isDirecteur]);

  const decider = async (id, accepter) => {
    try {
      const res = await adhesionService.decider(id, accepter);
      if (!accepter) setMessage('Demande refusée.');
      else if (res.membre === 'cree') setMessage('Demande acceptée, compte créé avec le mot de passe choisi par le candidat.');
      else if (res.membre === 'deja_existant') setMessage('Demande acceptée. Un membre avec cet email existait déjà, aucun nouveau compte créé.');
      else setMessage('Demande acceptée.');
      load();
    } catch {
      setMessage('Action impossible.');
    }
  };

  if (!isDirecteur) {
    return (
      <section className="page">
        <div className="page-head">
          <div>
            <p className="eyebrow">Module LIAS</p>
            <h1>Demandes d'adhésion</h1>
            <p>Seul le directeur en mandat peut consulter et traiter les candidatures.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Module LIAS</p>
          <h1>Demandes d'adhésion</h1>
          <p>Soumission, décision et traçabilité des candidatures.</p>
        </div>
      </div>
      {message && <p className="notice">{message}</p>}
      <div className="cards">
        {demandes.map((d) => (
          <article className="card" key={d.id}>
            <div className="card-top">
              <span className={`badge ${d.statut !== 'EN_ATTENTE' ? 'muted' : ''}`}>{d.statut}</span>
            </div>
            <h2>{d.prenom} {d.nom}</h2>
            <p>{d.motivation || 'Aucune motivation fournie.'}</p>
            <dl>
              <dt>Email</dt><dd>{d.email}</dd>
              {d.cvUrl && (<><dt>CV</dt><dd><button onClick={()=>ouvrirDocument(d.cvUrl).catch(()=>setMessage("CV indisponible."))}>Voir le CV</button></dd></>)}
            </dl>
            {d.statut === 'EN_ATTENTE' && (
              <div className="actions">
                <button onClick={() => decider(d.id, true)}>Accepter</button>
                <button className="danger" onClick={() => decider(d.id, false)}>Refuser</button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!demandes.length && <div className="empty">Aucune demande d'adhésion.</div>}
    </section>
  );
}
