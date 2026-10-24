import { useCallback, useEffect, useState } from 'react';
import materielService from '../services/materielService';
import membreService from '../services/membreService';

const videArrivage = { nom: '', description: '', quantiteTotal: 1 };
const videBesoin = { designation: '', justification: '' };

export default function MaterielPage({ canManage, user }) {
  const [onglet, setOnglet] = useState('distribution');
  const [items, setItems] = useState([]);
  const [attributions, setAttributions] = useState([]);
  const [membresListe, setMembresListe] = useState([]);
  const [besoins, setBesoins] = useState([]);
  const [message, setMessage] = useState('');

  const [formArrivage, setFormArrivage] = useState(null);
  const [formAttribution, setFormAttribution] = useState(null); // { itemId, membreId, quantite }
  const [formBesoin, setFormBesoin] = useState(null);

  const chargerDistribution = useCallback(() => {
    materielService.listerArrivages().then(setItems).catch(() => setItems([]));
    materielService.listerAttributions().then(setAttributions).catch(() => setAttributions([]));
    if (canManage) membreService.getMembres().then(setMembresListe).catch(() => setMembresListe([]));
  }, [canManage]);

  const chargerBesoins = useCallback(() => {
    (canManage ? materielService.listerBesoins() : materielService.mesBesoins())
      .then(setBesoins).catch(() => setBesoins([]));
  }, [canManage]);

  useEffect(() => { chargerDistribution(); }, [chargerDistribution]);
  useEffect(() => { if (onglet === 'besoins') chargerBesoins(); }, [onglet, chargerBesoins]);

  const creerArrivage = async (event) => {
    event.preventDefault();
    try { await materielService.creerArrivage(formArrivage); setFormArrivage(null); setMessage('Arrivage enregistré.'); chargerDistribution(); }
    catch { setMessage("Impossible d'enregistrer l'arrivage."); }
  };

  const attribuer = async (event) => {
    event.preventDefault();
    try { await materielService.attribuer(formAttribution.itemId, formAttribution.membreId, formAttribution.quantite); setFormAttribution(null); setMessage('Matériel attribué.'); chargerDistribution(); }
    catch (err) { setMessage(err.response?.data?.message || "Impossible d'attribuer ce matériel."); }
  };

  const confirmerReception = async (id) => {
    try { await materielService.confirmerReception(id); chargerDistribution(); } catch { setMessage('Action impossible.'); }
  };

  const soumettreBesoin = async (event) => {
    event.preventDefault();
    try { await materielService.soumettreBesoin(formBesoin); setFormBesoin(null); setMessage('Besoin soumis.'); chargerBesoins(); }
    catch { setMessage('Impossible de soumettre ce besoin.'); }
  };

  const deciderBesoin = async (id, valider) => {
    try { await materielService.deciderBesoin(id, valider); chargerBesoins(); } catch { setMessage('Action impossible.'); }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Module LIAS</p>
          <h1>Matériel &amp; besoins</h1>
          <p>Arrivages, distribution équitable et demandes de besoin en matériel.</p>
        </div>
        <div className="tabs">
          <button className={onglet === 'distribution' ? 'active' : ''} onClick={() => setOnglet('distribution')}>Distribution</button>
          <button className={onglet === 'besoins' ? 'active' : ''} onClick={() => setOnglet('besoins')}>Besoins</button>
        </div>
      </div>
      {message && <p className="notice">{message}</p>}

      {onglet === 'distribution' && (
        <>
          <div className="page-head">
            <h2>Arrivages</h2>
            {canManage && <button className="primary" onClick={() => setFormArrivage(videArrivage)}>+ Nouvel arrivage</button>}
          </div>
          <div className="cards">
            {items.map((item) => (
              <article className="card" key={item.id}>
                <span className="badge">{item.quantiteTotal - attributions.filter(a=>a.item?.id===item.id).reduce((n,a)=>n+a.quantite,0)} disponible(s) / {item.quantiteTotal}</span>
                <h2>{item.nom}</h2>
                <p>{item.description || 'Aucune description.'}</p>
                <dl><dt>Arrivage</dt><dd>{item.dateArrivage}</dd></dl>
                {canManage && <div className="actions"><button onClick={() => setFormAttribution({ itemId: item.id, membreId: '', quantite: 1 })}>Attribuer</button></div>}
              </article>
            ))}
            {!items.length && <div className="empty">Aucun arrivage enregistré.</div>}
          </div>

          {canManage && <><h2>Membres sans matériel reçu</h2><div className="cards">{membresListe.filter(m=>!['ANCIEN','RETRAITE'].includes(m.statutScientifique)&&!attributions.some(a=>a.membre?.id===m.id&&a.recu)).map(m=><article className="card" key={m.id}>{m.prenom} {m.nom}</article>)}</div></>}
          <h2>Qui a reçu quoi</h2>
          <div className="cards">
            {attributions.map((a) => (
              <article className="card" key={a.id}>
                <span className={`badge ${a.recu ? '' : 'muted'}`}>{a.recu ? 'Reçu' : 'En attente'}</span>
                <h2>{a.item?.nom} ×{a.quantite}</h2>
                <p>{a.membre?.prenom} {a.membre?.nom}</p>
                <dl><dt>Attribué le</dt><dd>{a.dateAttribution}</dd>{a.dateReception && <><dt>Reçu le</dt><dd>{a.dateReception}</dd></>}</dl>
                {!a.recu && (canManage || a.membre?.email === user.email) && <div className="actions"><button onClick={() => confirmerReception(a.id)}>Confirmer la réception</button></div>}
              </article>
            ))}
            {!attributions.length && <div className="empty">Aucune distribution pour l'instant.</div>}
          </div>
        </>
      )}

      {onglet === 'besoins' && (
        <>
          <div className="page-head">
            <h2>{canManage ? 'Toutes les demandes' : 'Mes demandes'}</h2>
            <button className="primary" onClick={() => setFormBesoin(videBesoin)}>+ Soumettre un besoin</button>
          </div>
          <div className="cards">
            {besoins.map((b) => (
              <article className="card" key={b.id}>
                <span className={`badge ${b.statut !== 'EN_ATTENTE' ? 'muted' : ''}`}>{b.statut}</span>
                <h2>{b.designation}</h2>
                <p>{b.justification || 'Aucune justification fournie.'}</p>
                {canManage && <dl><dt>Demandeur</dt><dd>{b.demandeur?.prenom} {b.demandeur?.nom}</dd></dl>}
                {canManage && b.statut === 'EN_ATTENTE' && (
                  <div className="actions">
                    <button onClick={() => deciderBesoin(b.id, true)}>Valider</button>
                    <button className="danger" onClick={() => deciderBesoin(b.id, false)}>Refuser</button>
                  </div>
                )}
              </article>
            ))}
            {!besoins.length && <div className="empty">Aucune demande.</div>}
          </div>
        </>
      )}

      {formArrivage && (
        <div className="overlay"><form className="modal" onSubmit={creerArrivage}>
          <div className="modal-head"><h2>Nouvel arrivage</h2><button type="button" onClick={() => setFormArrivage(null)}>×</button></div>
          <label>Nom<input required value={formArrivage.nom} onChange={(e) => setFormArrivage({ ...formArrivage, nom: e.target.value })} /></label>
          <label>Description<textarea value={formArrivage.description} onChange={(e) => setFormArrivage({ ...formArrivage, description: e.target.value })} /></label>
          <label>Quantité totale<input type="number" min="1" required value={formArrivage.quantiteTotal} onChange={(e) => setFormArrivage({ ...formArrivage, quantiteTotal: Number(e.target.value) })} /></label>
          <div className="actions"><button type="button" onClick={() => setFormArrivage(null)}>Annuler</button><button className="primary" type="submit">Enregistrer</button></div>
        </form></div>
      )}

      {formAttribution && (
        <div className="overlay"><form className="modal" onSubmit={attribuer}>
          <div className="modal-head"><h2>Attribuer le matériel</h2><button type="button" onClick={() => setFormAttribution(null)}>×</button></div>
          <label>Membre
            <select required value={formAttribution.membreId} onChange={(e) => setFormAttribution({ ...formAttribution, membreId: e.target.value })}>
              <option value="" disabled>Sélectionner un membre</option>
              {membresListe.filter(m=>!['ANCIEN','RETRAITE'].includes(m.statutScientifique)).map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
          </label>
          <label>Quantité<input type="number" min="1" value={formAttribution.quantite} onChange={(e) => setFormAttribution({ ...formAttribution, quantite: Number(e.target.value) })} /></label>
          <div className="actions"><button type="button" onClick={() => setFormAttribution(null)}>Annuler</button><button className="primary" type="submit">Attribuer</button></div>
        </form></div>
      )}

      {formBesoin && (
        <div className="overlay"><form className="modal" onSubmit={soumettreBesoin}>
          <div className="modal-head"><h2>Soumettre un besoin</h2><button type="button" onClick={() => setFormBesoin(null)}>×</button></div>
          <label>Désignation<input required value={formBesoin.designation} onChange={(e) => setFormBesoin({ ...formBesoin, designation: e.target.value })} /></label>
          <label>Justification<textarea value={formBesoin.justification} onChange={(e) => setFormBesoin({ ...formBesoin, justification: e.target.value })} /></label>
          <div className="actions"><button type="button" onClick={() => setFormBesoin(null)}>Annuler</button><button className="primary" type="submit">Soumettre</button></div>
        </form></div>
      )}
    </section>
  );
}
