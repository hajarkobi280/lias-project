import { useCallback, useEffect, useState } from 'react';
import mandatService from '../services/mandatService';
import membreService from '../services/membreService';

const libelleRole = (role) => ({
  DIRECTEUR: 'Directeur',
  VICE_DIRECTEUR: 'Vice-directeur',
  CHEF_EQUIPE: "Chef d'équipe",
  MEMBRE_EQUIPE: "Membre d'équipe",
  ADMIN: 'Administrateur système',
}[role] || role);

const videForm = { membreId: '', role: 'CHEF_EQUIPE', equipeNom: '', dateFin: '' };

export default function GouvernancePage({ canManage }) {
  const [actifs, setActifs] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [voirHistorique, setVoirHistorique] = useState(false);
  const [membres, setMembres] = useState([]);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    mandatService.listerActifs().then(setActifs).catch(() => setActifs([]));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (canManage) membreService.getMembres().then(setMembres).catch(() => setMembres([])); }, [canManage]);

  const chargerHistorique = async () => {
    setVoirHistorique(true);
    try { setHistorique(await mandatService.listerTout()); } catch { setHistorique([]); }
  };

  const attribuer = async (event) => {
    event.preventDefault();
    try {
      await mandatService.attribuer(form.membreId, form.role, form.equipeNom, form.dateFin);
      setMessage('Mandat attribué.');
      setForm(null); load(); if (voirHistorique) chargerHistorique();
    } catch (err) { setMessage(err.response?.data?.message || "Impossible d'attribuer ce mandat."); }
  };

  const cloturer = async (id) => {
    if (!confirm('Clôturer ce mandat ? Le membre redeviendra membre d\'équipe.')) return;
    try { await mandatService.cloturer(id); setMessage('Mandat clôturé.'); load(); if (voirHistorique) chargerHistorique(); }
    catch { setMessage('Impossible de clôturer ce mandat.'); }
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Module LIAS</p>
          <h1>Gouvernance &amp; mandats</h1>
          <p>Mandats du directeur, vice-directeur et chefs d'équipe en cours et historisés.</p>
        </div>
        <div className="actions">
          {!voirHistorique && <button onClick={chargerHistorique}>Voir l'historique complet</button>}
          {canManage && <button className="primary" onClick={() => setForm(videForm)}>+ Attribuer un mandat</button>}
        </div>
      </div>
      {message && <p className="notice">{message}</p>}

      <h2>Mandats actifs</h2>
      <div className="cards">
        {actifs.map((m) => (
          <article className="card" key={m.id}>
            <span className="badge">{libelleRole(m.role)}</span>
            <h2>{m.membre?.prenom} {m.membre?.nom}</h2>
            {m.equipeNom && <p>Équipe : {m.equipeNom}</p>}
            <dl><dt>Depuis</dt><dd>{m.dateDebut}</dd></dl>
            {canManage && m.role !== 'MEMBRE_EQUIPE' && (
              <div className="actions"><button className="danger" onClick={() => cloturer(m.id)}>Clôturer le mandat</button></div>
            )}
          </article>
        ))}
      </div>
      {!actifs.length && <div className="empty">Aucun mandat actif.</div>}

      {voirHistorique && (
        <>
          <h2>Historique complet</h2>
          <div className="cards">
            {historique.map((m) => (
              <article className="card" key={m.id}>
                <span className={`badge ${m.dateFin ? 'muted' : ''}`}>{libelleRole(m.role)}</span>
                <h2>{m.membre?.prenom} {m.membre?.nom}</h2>
                <dl>
                  <dt>Période</dt>
                  <dd>{m.dateDebut} → {m.dateFin || 'en cours'}</dd>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}

      {form && (
        <div className="overlay">
          <form className="modal" onSubmit={attribuer}>
            <div className="modal-head"><h2>Attribuer un mandat</h2><button type="button" onClick={() => setForm(null)}>×</button></div>
            {message && <p role="alert">{message}</p>}
            <label>Membre
              <select required value={form.membreId} onChange={(e) => setForm({ ...form, membreId: e.target.value })}>
                <option value="" disabled>Sélectionner un membre</option>
                {membres.map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
              </select>
            </label>
            <label>Rôle
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="CHEF_EQUIPE">Chef d'équipe</option>
                <option value="VICE_DIRECTEUR">Vice-directeur</option>
                <option value="DIRECTEUR">Directeur</option>
                <option value="MEMBRE_EQUIPE">Membre d'équipe</option>
                <option value="ADMIN">Administrateur système</option>
              </select>
            </label>
            <label>Fin du mandat (optionnelle)<input type="date" value={form.dateFin} onChange={e=>setForm({...form,dateFin:e.target.value})}/></label>
            <label>Équipe (obligatoire pour un chef d'équipe)
              <input required={form.role === 'CHEF_EQUIPE'} value={form.equipeNom} onChange={(e) => setForm({ ...form, equipeNom: e.target.value })} />
            </label>
            <div className="actions">
              <button type="button" onClick={() => setForm(null)}>Annuler</button>
              <button className="primary" type="submit">Attribuer</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
