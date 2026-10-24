import { useCallback, useEffect, useState } from 'react';
import elementService from '../services/elementService';
import membreService from '../services/membreService';
import api from '../services/api';
import { fusionnerEquipes } from '../services/equipes';
import { uploadDocument, ouvrirDocument } from '../services/documentService';

const empty = (categorie) => ({ categorie, titre: '', description: '', statut: 'ACTIF', responsable: '', dateDebut: '', dateFin: '', documentUrl: '', metadata: '' });

// Lit/écrit les liens métier (auteur, édition, organisateur, événement lié, partenaire...) dans le champ metadata (JSON)
const lireMeta = (item) => { try { return JSON.parse(item.metadata || '{}') || {}; } catch { return {}; } };
const ecrireMeta = (form, patch) => ({ ...form, metadata: JSON.stringify({ ...lireMeta(form), ...patch }) });

export default function ElementPage({ categorie, titre, aide, canManage, user }) {
  const [items, setItems] = useState([]); const [form, setForm] = useState(null); const [query, setQuery] = useState(''); const [message, setMessage] = useState('');
  const [participants,setParticipants]=useState(null);
  const participer=async id=>{try{await api.post(`/evenements/${id}/participations`);setMessage('Votre participation est enregistrée.');}catch(err){setMessage(err.response?.data?.message||'Inscription impossible.');}};
  const voirParticipants=async id=>{try{setParticipants((await api.get(`/evenements/${id}/participations`)).data);}catch{setMessage('Participants indisponibles.');}};
  const [historique, setHistorique] = useState(null);
  const [year, setYear] = useState('');
  const [equipe, setEquipe] = useState('');
  const [uploading, setUploading] = useState(false);
  const canEdit = item => canManage && (user.statut === 'PERMANENT' || ['ADMIN','DIRECTEUR'].includes(user.role) || item.creePar === user.email);
  const showHistory = async id => { try { setHistorique((await api.get(`/elements/${id}/historique`)).data); } catch { setMessage('Historique indisponible.'); } };
  const upload = async file => { if(!file)return; setUploading(true);try { const result=await uploadDocument(file);setForm(f=>({...f,documentUrl:result.url})); } catch(err){setMessage(err.response?.data?.message||'Téléversement impossible.');} finally{setUploading(false);} };
  const download = async url => {try{await ouvrirDocument(url);}catch{setMessage('Document indisponible.');}};
  const [membres, setMembres] = useState([]);
  const actif = membre => !['RETRAITE','ANCIEN'].includes(membre.statutScientifique);
  const [evenements, setEvenements] = useState([]);
  const avecMembres = categorie === 'PUBLICATIONS' || categorie === 'EVENEMENTS';

  const load = useCallback(() => {
    const request = categorie === 'EQUIPES'
      ? Promise.all([elementService.list(categorie), api.get('/public/equipes')])
        .then(([fiches, annuaire]) => fusionnerEquipes(fiches, annuaire.data))
      : elementService.list(categorie);
    return request.then(setItems).catch(() => setMessage('Impossible de charger les données.'));
  }, [categorie]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (avecMembres) membreService.getMembres().then(setMembres).catch(() => setMembres([])); }, [avecMembres]);
  useEffect(() => { if (categorie === 'DOCUMENTS') elementService.list('EVENEMENTS').then(setEvenements).catch(() => setEvenements([])); }, [categorie]);

  const save = async (event) => { event.preventDefault(); try { const data = {...form, dateDebut:form.dateDebut||null,dateFin:form.dateFin||null}; form.id ? await elementService.update(form.id, data) : await elementService.create(data); setForm(null); setMessage('Enregistrement effectué.'); load(); } catch (err) { setMessage(err.response?.data?.message || 'Enregistrement impossible.'); } };
  const archive = async (id) => { if (confirm('Archiver cet élément ?')) { try {await elementService.archive(id); load();}catch{setMessage('Archivage impossible.');} } };
  const nomMembre = (id) => { const m = membres.find(mb => String(mb.id) === String(id)); return m ? `${m.prenom} ${m.nom}` : null; };
  const filtered = items.filter(i => `${i.titre} ${i.description} ${i.responsable} ${nomMembre(lireMeta(i).auteurMembreId)||''} ${lireMeta(i).equipeNom||''}`.toLowerCase().includes(query.toLowerCase()) && (!year || i.dateDebut?.startsWith(year)) && (!equipe || lireMeta(i).equipeNom === equipe));
  const titreEvenement = (id) => { const e = evenements.find(ev => String(ev.id) === String(id)); return e ? e.titre : null; };

  return <section className="page"><div className="page-head"><div><p className="eyebrow">Module LIAS</p><h1>{titre}</h1><p>{aide}</p></div>{canManage && <button className="primary" onClick={() => setForm({...empty(categorie), metadata: categorie === 'PUBLICATIONS' ? JSON.stringify({auteurMembreId:user.id}) : ''})}>+ Ajouter</button>}</div>
    {message && <p className="notice">{message}</p>}<input className="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={`Rechercher dans ${titre.toLowerCase()}...`} />
    {categorie === 'PUBLICATIONS' && <div className="form-grid"><label>Année<input type="number" placeholder="Toutes" value={year} onChange={e=>setYear(e.target.value)}/></label><label>Équipe<select value={equipe} onChange={e=>setEquipe(e.target.value)}><option value="">Toutes</option>{[...new Set(items.map(i=>lireMeta(i).equipeNom).filter(Boolean))].map(n=><option key={n}>{n}</option>)}</select></label></div>}
    <div className="cards">{filtered.map(item => {
      const meta = lireMeta(item);
      return <article className="card" key={item.id ?? `equipe-${item.titre}`}><div className="card-top"><span className={`badge ${item.statut === 'ARCHIVE' ? 'muted' : ''}`}>{item.statut || 'ACTIF'}</span>{item.dateDebut && <time>{item.dateDebut}</time>}</div><h2>{item.titre}</h2><p>{item.description || (categorie === 'EQUIPES' ? 'Équipe de recherche du laboratoire LIAS.' : 'Aucune description.')}</p><dl><dt>{categorie === 'EQUIPES' ? 'Chef en mandat' : 'Responsable'}</dt><dd>{item.responsable || 'Non attribué'}</dd>{categorie === 'EQUIPES' && item.effectif != null && <><dt>Membres actifs</dt><dd>{item.effectif}</dd></>}
        {categorie === 'EQUIPES' && item.membres?.length > 0 && <><dt>Membres</dt><dd><ul>{item.membres.map((nom, index) => <li key={index}>{nom}</li>)}</ul></dd></>}
        {categorie === 'EQUIPES' && meta.nomComplet && <><dt>Nom complet</dt><dd>{meta.nomComplet}</dd></>}{categorie === 'EQUIPES' && meta.axesRecherche && <><dt>Axes de recherche</dt><dd>{meta.axesRecherche}</dd></>}
        {categorie === 'PUBLICATIONS' && meta.auteurMembreId && <><dt>Auteur</dt><dd>{nomMembre(meta.auteurMembreId) || '—'}</dd></>}
        {categorie === 'PUBLICATIONS' && meta.equipeNom && <><dt>Équipe</dt><dd>{meta.equipeNom}</dd></>}
        {categorie === 'EVENEMENTS' && meta.type && <><dt>Type</dt><dd>{meta.type}</dd></>}
        {categorie === 'EVENEMENTS' && meta.organisateurs?.length > 0 && <><dt>Organisateurs</dt><dd>{meta.organisateurs.map(id=>nomMembre(id)||id).join(', ')}</dd></>}
        {categorie === 'EVENEMENTS' && meta.edition && <><dt>Édition</dt><dd>{meta.edition}</dd></>}
        {categorie === 'EVENEMENTS' && meta.organisateurMembreId && <><dt>Organisateur</dt><dd>{nomMembre(meta.organisateurMembreId) || '—'}</dd></>}
        {categorie === 'DOCUMENTS' && meta.evenementId && <><dt>Événement lié</dt><dd>{titreEvenement(meta.evenementId) || '—'}</dd></>}
        {categorie === 'CONVENTIONS' && meta.activites && <><dt>Activités associées</dt><dd>{meta.activites}</dd></>}
        {categorie === 'CONVENTIONS' && meta.partenaire && <><dt>Partenaire</dt><dd>{meta.partenaire}</dd></>}
        {categorie === 'PV' && meta.ordreDuJour && <><dt>Ordre du jour</dt><dd>{meta.ordreDuJour}</dd></>}
        {categorie === 'PV' && meta.presents && <><dt>Présents</dt><dd>{meta.presents}</dd></>}
        {item.dateFin && <><dt>Fin</dt><dd>{item.dateFin}</dd></>}</dl>{item.documentUrl && <button onClick={()=>download(item.documentUrl)}>Télécharger le document</button>}{!item.depuisAnnuaire && <button onClick={()=>showHistory(item.id)}>Historique</button>}{categorie === 'EVENEMENTS' && <div className="actions"><button onClick={()=>voirParticipants(item.id)}>Participants</button>{item.statut !== 'ARCHIVE' && <button onClick={()=>participer(item.id)}>Participer</button>}</div>}{!item.depuisAnnuaire && canEdit(item) && <div className="actions"><button onClick={() => setForm(item)}>Modifier</button><button className="danger" onClick={() => archive(item.id)}>Archiver</button></div>}</article>;
    })}</div>
    {!filtered.length && <div className="empty">Aucun élément à afficher.</div>}
    {form && <div className="overlay"><form className="modal" onSubmit={save}><div className="modal-head"><h2>{categorie === 'EQUIPES' ? (form.id ? 'Modifier l’équipe' : 'Ajouter une équipe') : `${form.id ? 'Modifier' : 'Nouveau'} : ${titre}`}</h2><button type="button" onClick={() => setForm(null)}>×</button></div>{message && <p className="notice">{message}</p>}<label>{categorie === 'EQUIPES' ? 'Nom court / sigle de l’équipe' : 'Titre'}<input required value={form.titre} onChange={e => setForm({...form, titre:e.target.value})}/></label><label>Description<textarea value={form.description || ''} onChange={e => setForm({...form, description:e.target.value})}/></label>{categorie === 'EQUIPES' ? <>
        <label>Nom complet<input value={lireMeta(form).nomComplet || ''} onChange={e=>setForm(ecrireMeta(form,{nomComplet:e.target.value}))}/></label>
        <label>Axes de recherche<textarea value={lireMeta(form).axesRecherche || ''} onChange={e=>setForm(ecrireMeta(form,{axesRecherche:e.target.value}))}/></label>
        <div className="form-grid"><label>Statut<select value={form.statut || 'ACTIF'} onChange={e=>setForm({...form,statut:e.target.value})}><option value="ACTIF">Active</option><option value="ARCHIVE">Archivée</option></select></label><label>Date de création<input type="date" value={form.dateDebut || ''} onChange={e=>setForm({...form,dateDebut:e.target.value})}/></label></div>
        <p className="notice">Le chef est désigné dans Gouvernance &amp; mandats. Les membres sont rattachés à cette équipe depuis leur fiche, avec le même nom court.</p>
      </> : <div className="form-grid"><label>Statut<input value={form.statut || ''} onChange={e => setForm({...form, statut:e.target.value})}/></label><label>Responsable<input value={form.responsable || ''} onChange={e => setForm({...form, responsable:e.target.value})}/></label><label>Date début<input type="date" value={form.dateDebut || ''} onChange={e => setForm({...form, dateDebut:e.target.value})}/></label><label>Date fin<input type="date" value={form.dateFin || ''} onChange={e => setForm({...form, dateFin:e.target.value})}/></label></div>}

      {categorie === 'PUBLICATIONS' && <div className="form-grid">
        <label>Auteur (membre)
          <select disabled={user.statut === "DOCTORANT" || user.statut === "ASSOCIE"} value={lireMeta(form).auteurMembreId || ''} onChange={e => setForm(ecrireMeta(form, { auteurMembreId: e.target.value }))}>
            <option value="">Non renseigné</option>
            {membres.map(m => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
          </select>
        </label>
        <label>Équipe<input value={lireMeta(form).equipeNom || ''} onChange={e => setForm(ecrireMeta(form, { equipeNom: e.target.value }))}/></label>
      </div>}

      {categorie === 'EVENEMENTS' && <div className="form-grid">
        <label>Type<select value={lireMeta(form).type || 'CONFERENCE'} onChange={e=>setForm(ecrireMeta(form,{type:e.target.value}))}><option>CONFERENCE</option><option>SEMINAIRE</option><option>WORKSHOP</option></select></label>
        <label>Édition<input placeholder="ex: 3ème édition" value={lireMeta(form).edition || ''} onChange={e => setForm(ecrireMeta(form, { edition: e.target.value }))}/></label>
        <fieldset className="organisateurs-selection">
          <legend>Organisateurs supplémentaires</legend>
          <p>Cochez un ou plusieurs membres.</p>
          <div className="organisateurs-liste">{membres.filter(m=>actif(m)||(lireMeta(form).organisateurs || []).map(String).includes(String(m.id))).map(m=>{
            const selection=(lireMeta(form).organisateurs || []).map(String);
            const id=String(m.id);
            return <label key={m.id}><input type="checkbox" checked={selection.includes(id)} onChange={e=>setForm(ecrireMeta(form,{organisateurs:e.target.checked ? [...selection,id] : selection.filter(value=>value!==id)}))}/><span>{m.prenom} {m.nom}{!actif(m) && ' — inactif (affectation conservée)'}</span></label>;
          })}{!membres.length && <p>Aucun membre disponible.</p>}</div>
          <p aria-live="polite">{(lireMeta(form).organisateurs || []).length} sélectionné(s)</p>
        </fieldset>
        <label>Organisateur (membre)
          <select value={lireMeta(form).organisateurMembreId || ''} onChange={e => setForm(ecrireMeta(form, { organisateurMembreId: e.target.value }))}>
            <option value="">Non renseigné</option>
            {membres.filter(m=>actif(m)||String(m.id)===String(lireMeta(form).organisateurMembreId)).map(m => <option key={m.id} value={m.id} disabled={!actif(m)}>{m.prenom} {m.nom}{!actif(m) ? ' — inactif (historique)' : ''}</option>)}
          </select>
        </label>
      </div>}

      {categorie === 'DOCUMENTS' && <label>Type de document<select value={lireMeta(form).type || 'RAPPORT'} onChange={e=>setForm(ecrireMeta(form,{type:e.target.value}))}>{['RAPPORT','PROGRAMME','ATTESTATION','FINANCEMENT','ADMINISTRATIF'].map(t=><option key={t}>{t}</option>)}</select></label>}
      {categorie === 'DOCUMENTS' && <label>Événement associé (optionnel — section 10 : archivage par événement)
        <select value={lireMeta(form).evenementId || ''} onChange={e => setForm(ecrireMeta(form, { evenementId: e.target.value }))}>
          <option value="">Aucun événement associé</option>
          {evenements.map(ev => <option key={ev.id} value={ev.id}>{ev.titre}</option>)}
        </select>
      </label>}

      {categorie === 'CONVENTIONS' && <label>Activités associées<textarea value={lireMeta(form).activites || ''} onChange={e=>setForm(ecrireMeta(form,{activites:e.target.value}))}/></label>}
      {categorie === 'CONVENTIONS' && <label>Partenaire<input placeholder="Nom de l'organisme partenaire" value={lireMeta(form).partenaire || ''} onChange={e => setForm(ecrireMeta(form, { partenaire: e.target.value }))}/></label>}

      {categorie === 'PV' && <div className="form-grid">
        <label>Ordre du jour<textarea value={lireMeta(form).ordreDuJour || ''} onChange={e => setForm(ecrireMeta(form, { ordreDuJour: e.target.value }))}/></label>
        <label>Présents (séparés par des virgules)<input value={lireMeta(form).presents || ''} onChange={e => setForm(ecrireMeta(form, { presents: e.target.value }))}/></label>
      </div>}

      {categorie !== 'EQUIPES' && <><label>Importer une pièce jointe (10 Mo maximum)<input type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt" onChange={e=>upload(e.target.files[0])}/></label><label>Lien document / pièce jointe<input type="text" value={form.documentUrl || ''} onChange={e => setForm({...form, documentUrl:e.target.value})}/></label></>}<div className="actions"><button type="button" onClick={() => setForm(null)}>Annuler</button><button className="primary" disabled={uploading} type="submit">{uploading ? "Téléversement…" : "Enregistrer"}</button></div></form></div>}{participants && <div className="overlay"><div className="modal"><div className="modal-head"><h2>Participants</h2><button onClick={()=>setParticipants(null)}>×</button></div>{participants.map(p=><p key={p.id}>{p.membre.prenom} {p.membre.nom}</p>)}{!participants.length&&<p>Aucune inscription.</p>}</div></div>}{historique && <div className="overlay"><div className="modal"><div className="modal-head"><h2>Versions et historique</h2><button onClick={()=>setHistorique(null)}>×</button></div>{historique.map(h=><details key={h.id}><summary>{h.date} · {h.action} · {h.auteur}</summary><pre style={{whiteSpace:'pre-wrap'}}>{h.contenu}</pre>{(()=>{try{const d=JSON.parse(h.contenu).documentUrl;return d&&<button onClick={()=>download(d)}>Document de cette version</button>;}catch{return null;}})()}</details>)}</div></div>}</section>;
}
