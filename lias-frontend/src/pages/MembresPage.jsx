import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { preparerPhoto } from '../services/photo';
const labels = { nom: 'Nom', prenom: 'Prénom', email: 'Email', etablissementOrigine: "Établissement d’origine", laboratoireOrigine: "Laboratoire d’origine", biographie: 'Biographie', centresInteret: "Centres d’intérêt", photoUrl: 'Lien photo', dateNaissance: 'Date de naissance (privée)', dateEmbauche: "Date d’embauche", dateAffiliation: "Date d’affiliation", equipeNom: 'Équipe actuelle', motDePasse: 'Mot de passe (8 caractères minimum)' };
const vide = { nom: '', prenom: '', email: '', statutInitial: 'ASSOCIE', roleInitial: 'MEMBRE_EQUIPE', motDePasse: '' };
export default function MembresPage({ user, profilRequest = 0, onProfileSaved, onProfileClose }) {
 const [membres, setMembres] = useState([]), [q, setQ] = useState(''), [form, setForm] = useState(null), [personnel, setPersonnel] = useState(false), [message, setMessage] = useState(''), [historique, setHistorique] = useState(null), [profil, setProfil] = useState(null);
 const canManage = ['ADMIN','DIRECTEUR'].includes(user.role);
 const interne = canManage || user.statut === 'PERMANENT';
 const load = useCallback(() => api.get('/membres').then(r => setMembres(r.data)).catch(() => setMessage('Impossible de charger les membres.')), []);
 useEffect(() => { load(); }, [load]);
 const ouvrir = async (membre, moi = false) => {
  setPersonnel(moi);
  if (moi) { try { const { data } = await api.get('/membres/mon-profil'); setForm({ ...data.membre, dateNaissance: data.dateNaissance, motDePasse: '' }); } catch { setMessage('Profil indisponible.'); } }
  else setForm(membre ? { ...membre, statutInitial: membre.statutScientifique, roleInitial: membre.roleGouvernance, motDePasse: '' } : { ...vide });
 };
 useEffect(() => {
  if (!profilRequest) return;
  let active = true;
  api.get('/membres/mon-profil').then(({data}) => {
   if (active) { setPersonnel(true); setForm({...data.membre, dateNaissance:data.dateNaissance, motDePasse:''}); }
  }).catch(() => { if(active) setMessage('Profil indisponible.'); });
  return () => { active = false; };
 }, [profilRequest]);
 const [photoEnCours, setPhotoEnCours] = useState(false);
 const choisirPhoto = async file => {
  if(!file)return; setPhotoEnCours(true);
  try { const photoUrl = await preparerPhoto(file); setForm(f=>({...f,photoUrl})); }
  catch(err){setMessage(err.message || 'Image illisible.');}
  finally {setPhotoEnCours(false);}
 };
 const [saving, setSaving] = useState(false);
 const [saveError, setSaveError] = useState('');
 const save = async e => {
  e.preventDefault();
  if(saving || photoEnCours)return;
  setSaving(true);setSaveError('');
  const payload = Object.fromEntries(Object.entries(form).filter(([key,value]) => [...Object.keys(labels), 'statutInitial', 'roleInitial'].includes(key) && (!key.startsWith('date') || value)));
  try { if(personnel) await api.put('/membres/mon-profil', payload); else if(form.id) await api.put(`/membres/${form.id}`, payload); else await api.post('/membres',payload); if(personnel) onProfileSaved?.({nom:form.nom,prenom:form.prenom,photoUrl:form.photoUrl || ''}); setForm(null);onProfileClose?.();setMessage('Profil enregistré.');load(); }
  catch(err){setSaveError(err.response?.data?.message || 'Enregistrement impossible. Réessaie après avoir vérifié la connexion au serveur.');}
  finally {setSaving(false);}
 };
 const voirHistorique = async m => {
  try { const responses = await Promise.all([api.get(`/membres/${m.id}/affiliations`), api.get(`/historique-statuts/membre/${m.id}`), api.get(`/mandats/membre/${m.id}`), api.get(`/membres/${m.id}/historique`)]);setHistorique({ membre:m, affiliations:responses[0].data, statuts:responses[1].data, mandats:responses[2].data, journal:responses[3].data }); } catch {setMessage('Historique indisponible.');}
 };
 const statut = async (m, valeur) => { if(!confirm(`Passer ${m.prenom} ${m.nom} au statut ${valeur} ?`))return;try {const {data}=await api.put(`/membres/${m.id}/statut`,null,{params:{statut:valeur}});if(data.statutScientifique!==valeur)throw new Error('Le statut demandé n’a pas été enregistré.');setMessage(`Statut enregistré : ${valeur}. ${['ANCIEN','RETRAITE'].includes(valeur) ? 'La connexion de ce compte est désormais bloquée.' : ''}`);load();}catch(err){setMessage(err.response?.data?.message||err.message||'Modification impossible.');} };
 const voirProfil = async m => {try {const {data}=await api.get('/elements',{params:{categorie:'PUBLICATIONS'}});setProfil({membre:m,publications:data.filter(p=>{try{return String(JSON.parse(p.metadata||'{}').auteurMembreId)===String(m.id);}catch{return false;}})});}catch{setMessage('Profil indisponible.');}};
 const champs = Object.keys(labels).filter(k => k !== 'photoUrl').filter(k => personnel ? !['email','dateEmbauche','dateAffiliation','equipeNom'].includes(k) : k !== 'dateNaissance' && (k !== 'dateAffiliation' || !form?.id));
 return <section className="page"><div className="page-head"><div><p className="eyebrow">Annuaire</p><h1>Membres du laboratoire</h1><p>Profils, affiliations et responsabilités.</p></div><div className="actions">{canManage&&<button className="primary" onClick={()=>ouvrir(null)}>+ Ajouter un membre</button>}</div></div>
 {message&&<p className="notice" role="status">{message}</p>}<input className="search" placeholder="Nom, email, équipe…" value={q} onChange={e=>setQ(e.target.value)}/>
 <div className="cards">{membres.filter(m=>`${m.nom} ${m.prenom} ${m.email} ${m.equipeNom}`.toLowerCase().includes(q.toLowerCase())).map(m=><article className="card" key={m.id}>{m.photoUrl&&<img src={m.photoUrl} alt="" width="64" height="64" style={{objectFit:'cover',borderRadius:'50%'}}/>}<h2>{m.prenom} {m.nom}</h2><p>{m.email}</p><span className="badge">{m.statutScientifique}</span><p>{m.roleGouvernance?.replaceAll('_',' ')} · {m.equipeNom||'Sans équipe'}</p><p>{m.biographie}</p><dl><dt>Établissement</dt><dd>{m.etablissementOrigine||'—'}</dd><dt>Laboratoire d’origine</dt><dd>{m.laboratoireOrigine||'—'}</dd><dt>Affiliation</dt><dd>{m.dateAffiliation||'—'}</dd><dt>Centres d’intérêt</dt><dd>{m.centresInteret||'—'}</dd></dl><div className="actions">{user.role !== 'ADMIN' && <button onClick={()=>voirProfil(m)}>Publications</button>}{interne&&<button onClick={()=>voirHistorique(m)}>Historique</button>}{canManage&&<><button onClick={()=>ouvrir(m)}>Modifier</button>{['ANCIEN','RETRAITE'].includes(m.statutScientifique)?<button onClick={()=>statut(m,'PERMANENT')}>Réactiver</button>:<><button onClick={()=>statut(m,'RETRAITE')}>Retraite</button><button onClick={()=>statut(m,'ANCIEN')}>Départ</button></>}</>}</div></article>)}</div>
 {form&&<div className="overlay"><form className="modal" onSubmit={save}><div className="modal-head"><h2>{personnel?'Mon profil':form.id?'Modifier le membre':'Nouveau membre'}</h2><button type="button" onClick={()=>{setForm(null);onProfileClose?.();}}>×</button></div>{message&&<p role="status">{message}</p>}<label>Photo de profil<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choisirPhoto(e.target.files[0])}/></label><p>JPG, PNG ou WebP, 5 Mo maximum.</p>{form.photoUrl && <div><img src={form.photoUrl} alt="Aperçu du profil" width="80" height="80" style={{borderRadius:'50%',objectFit:'cover'}}/><button type="button" onClick={()=>setForm({...form,photoUrl:''})}>Retirer la photo</button></div>}<div className="form-grid">{champs.map(k=><label key={k}>{labels[k]}<input type={k.startsWith('date')?'date':k==='motDePasse'?'password':k==='email'?'email':k==='photoUrl'?'url':'text'} required={['nom','prenom','email'].includes(k)||(!personnel&&!form.id&&k==='motDePasse')} minLength={k==='motDePasse'?8:undefined} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div>{!personnel&&<div className="form-grid"><label>Statut<select value={form.statutInitial} onChange={e=>setForm({...form,statutInitial:e.target.value})}>{['PERMANENT','ASSOCIE','DOCTORANT','RETRAITE','ANCIEN'].map(s=><option key={s}>{s}</option>)}</select></label><label>Rôle<select value={form.roleInitial} onChange={e=>setForm({...form,roleInitial:e.target.value})}>{['MEMBRE_EQUIPE','CHEF_EQUIPE','VICE_DIRECTEUR','DIRECTEUR','ADMIN'].map(s=><option key={s}>{s}</option>)}</select></label></div>}<div className="profile-save">{saveError && <p role="alert">{saveError}</p>}<button className="primary" type="submit" disabled={photoEnCours || saving}>{saving ? "Enregistrement…" : photoEnCours ? "Préparation…" : "Enregistrer"}</button></div></form></div>}
 {historique&&<div className="overlay"><div className="modal"><div className="modal-head"><h2>Historique de {historique.membre.prenom}</h2><button onClick={()=>setHistorique(null)}>×</button></div>{[['affiliations','Affiliations'],['statuts','Statuts'],['mandats','Mandats']].map(([key,title])=><div key={key}><h3>{title}</h3>{historique[key].map(h=><p key={h.id}>{h.statut||h.role||'Affiliation'} : {h.dateDebut} → {h.dateFin||'en cours'}</p>)}{!historique[key].length&&<p>Aucun historique enregistré.</p>}</div>)}<h3>Modifications du profil</h3>{historique.journal.map(h=><details key={h.id}><summary>{h.date} · {h.action} · {h.auteur}</summary><pre style={{whiteSpace:'pre-wrap'}}>{h.contenu}</pre></details>)}</div></div>}
 {profil&&<div className="overlay"><div className="modal"><div className="modal-head"><h2>Publications de {profil.membre.prenom} {profil.membre.nom}</h2><button onClick={()=>setProfil(null)}>×</button></div>{profil.publications.map(p=><p key={p.id}>{p.dateDebut} — {p.titre}</p>)}{!profil.publications.length&&<p>Aucune publication associée.</p>}</div></div>}
 </section>;
}
