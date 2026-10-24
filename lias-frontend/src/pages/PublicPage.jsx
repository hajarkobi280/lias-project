import { useEffect, useState } from 'react';
import api from '../services/api';
import { uploadDocument } from '../services/documentService';
import adhesionService from '../services/adhesionService';

const videCandidature = { nom: '', prenom: '', email: '', motivation: '', cvUrl: '', motDePasse:'', etablissementOrigine:'', laboratoireOrigine:'' };

export default function PublicPage({ onBack }) {
  const [onglet, setOnglet] = useState('presentation'); // presentation | equipes | EVENEMENTS | PUBLICATIONS | candidature
  const [laboratoire,setLaboratoire]=useState(null);
  useEffect(()=>{api.get('/public/laboratoire').then(r=>setLaboratoire(r.data)).catch(()=>{});},[]);
  const [contenus, setContenus] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [candidature, setCandidature] = useState(videCandidature);
  const [message, setMessage] = useState('');
  const [code,setCode] = useState('');
  const [uploading,setUploading] = useState(false);
  const [sending,setSending] = useState(false);
  const televerser = async file => {if(!file)return;setUploading(true);try{const d=await uploadDocument(file,true);setCandidature(c=>({...c,cvUrl:d.url}));setMessage('CV ajouté.');}catch(e){setMessage(e.response?.data?.message||'Téléversement impossible.');}finally{setUploading(false);}};
  const suivre = async () => {try{const {data}=await api.post('/adhesions/public/suivi',{code});setMessage(data.message);}catch{setMessage('Code de suivi introuvable.');}};

  useEffect(() => {
    if (onglet === 'EVENEMENTS' || onglet === 'PUBLICATIONS') {
      api.get('/public/contenus', { params: { categorie: onglet } })
        .then(r => setContenus(r.data)).catch(() => setContenus([]));
    }
    if (onglet === 'equipes') {
      api.get('/public/equipes')
        .then(r => setEquipes(r.data)).catch(() => setEquipes([]));
    }
  }, [onglet]);

  const soumettre = async (event) => {
    event.preventDefault();
    if(sending || uploading)return;
    setSending(true);
    try {
      const result = await adhesionService.soumettre(candidature);
      setCode(result.codeSuivi);
      setMessage("Candidature envoyée. Conservez votre code de suivi ci-dessous pour consulter la décision.");
      setCandidature(videCandidature);
    } catch (error) {
      setMessage(error.response?.data?.message || (!error.response
        ? 'Serveur inaccessible. Vérifiez votre connexion et le démarrage du backend.'
        : "L'envoi a échoué côté serveur. Vos informations sont conservées ; réessayez plus tard."));
    } finally { setSending(false); }
  };

  return (
    <main className="public">
      <header>
        <div className="public-brand"><img src="/lias-logo.png" alt="LIAS" /><div><strong>LIAS</strong><span>Laboratoire d'Intelligence Artificielle et Systèmes</span></div></div>
        <button onClick={onBack}>Espace membre</button>
      </header>
      <section className="public-hero">
        <p className="eyebrow">FSBM - Université Hassan II</p>
        <h1>Recherche, innovation et collaboration.</h1>
        <p>Le LIAS fédère chercheurs, doctorants et partenaires autour de l'intelligence artificielle et des systèmes.</p>
      </section>
      <section className="public-content">
        <div className="public-tabs">
          <button className={onglet === 'presentation' ? 'active' : ''} onClick={() => setOnglet('presentation')}>Présentation</button>
          <button className={onglet === 'equipes' ? 'active' : ''} onClick={() => setOnglet('equipes')}>Équipes</button>
          <button className={onglet === 'EVENEMENTS' ? 'active' : ''} onClick={() => setOnglet('EVENEMENTS')}>Activités</button>
          <button className={onglet === 'PUBLICATIONS' ? 'active' : ''} onClick={() => setOnglet('PUBLICATIONS')}>Publications</button>
          <button className={onglet === 'candidature' ? 'active' : ''} onClick={() => setOnglet('candidature')}>Rejoindre le laboratoire</button>
        </div>

        {onglet === 'presentation' && (
          <>
            <h2>À propos du {laboratoire?.nom||"LIAS"}</h2><p>{laboratoire?.presentation}</p>{laboratoire?.dateCreation&&<p>Créé le {laboratoire.dateCreation}</p>}
            <p>
              Le Laboratoire d'Intelligence Artificielle et Systèmes (LIAS) est rattaché à la Faculté des
              Sciences Ben M'Sik, Université Hassan II de Casablanca. Il réunit enseignants-chercheurs,
              doctorants et collaborateurs autour de projets de recherche en intelligence artificielle,
              data science et systèmes d'information.
            </p>
            <p>
              Ses missions couvrent la production scientifique (publications, événements), la formation
              des jeunes chercheurs, et la collaboration avec des partenaires académiques et industriels
              à travers des conventions et projets communs.
            </p>
          </>
        )}

        {onglet === 'equipes' && (
          <>
            <h2>Équipes de recherche</h2>
            <div className="cards">
              {equipes.map((e) => (
                <article className="card" key={e.nom}>
                  <span className="badge">{e.effectif} membre(s)</span>
                  <h2>{e.nom}</h2>
                  {e.membres?.length > 0 && <div><strong>Membres</strong><ul>{e.membres.map((nom, index) => <li key={index}>{nom}</li>)}</ul></div>}
                  <p>{e.chefEquipe ? `Chef d'équipe : ${e.chefEquipe}` : "Chef d'équipe non attribué"}</p>
                </article>
              ))}
            </div>
            {!equipes.length && <p className="empty">Aucune équipe renseignée pour l'instant.</p>}
          </>
        )}

        {(onglet === 'EVENEMENTS' || onglet === 'PUBLICATIONS') && (
          <>
            <h2>{onglet === 'EVENEMENTS' ? 'Activités scientifiques' : 'Publications récentes'}</h2>
            {contenus.length
              ? <div className="cards">{contenus.map(item => <article className="card" key={item.id}><time>{item.dateDebut || 'LIAS'}</time><h2>{item.titre}</h2><p>{item.description}</p>{onglet === 'PUBLICATIONS' && item.documentUrl && (()=>{
                const url=item.documentUrl.startsWith('/api/documents/fichier/') ? `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${item.documentUrl.replace('/fichier/','/publications/')}` : /^https?:\/\//i.test(item.documentUrl) ? item.documentUrl : null;
                return url && <a href={url} target="_blank" rel="noopener noreferrer">Télécharger la publication</a>;
              })()}</article>)}</div>
              : <p className="empty">Les contenus publiés apparaîtront ici.</p>}
          </>
        )}

        {onglet === 'candidature' && (
          <>
            <h2>Demande d'adhésion au laboratoire</h2>
            {message && <p className="notice">{message}</p>}
            <form className="candidature-form" onSubmit={soumettre}>
              <div className="form-grid">
                <label>Nom<input required value={candidature.nom} onChange={e => setCandidature({ ...candidature, nom: e.target.value })} /></label>
                <label>Prénom<input required value={candidature.prenom} onChange={e => setCandidature({ ...candidature, prenom: e.target.value })} /></label>
              </div>
              <label>Email<input type="email" required value={candidature.email} onChange={e => setCandidature({ ...candidature, email: e.target.value })} /></label>
              <label>Lettre de motivation<textarea required value={candidature.motivation} onChange={e => setCandidature({ ...candidature, motivation: e.target.value })} /></label>
              <label>Choisir un mot de passe<input type="password" required minLength="8" value={candidature.motDePasse} onChange={e=>setCandidature({...candidature,motDePasse:e.target.value})}/></label><label>Établissement<input required value={candidature.etablissementOrigine} onChange={e=>setCandidature({...candidature,etablissementOrigine:e.target.value})}/></label><label>Laboratoire d’origine<input value={candidature.laboratoireOrigine} onChange={e=>setCandidature({...candidature,laboratoireOrigine:e.target.value})}/></label><label>Importer le CV (PDF)<input type="file" accept=".pdf" onChange={e=>televerser(e.target.files[0])}/></label><label>Lien vers le CV<input type="text" value={candidature.cvUrl} onChange={e => setCandidature({ ...candidature, cvUrl: e.target.value })} /></label>
              <button className="primary" disabled={uploading || sending} type="submit">{sending ? "Envoi en cours…" : "Envoyer ma candidature"}</button>
            </form>
            <section className="candidature-suivi" aria-labelledby="suivi-titre">
              <h3 id="suivi-titre">Suivre ma candidature</h3>
              <label htmlFor="code-suivi">Code de suivi privé</label>
              <div className="suivi-actions">
                <input id="code-suivi" value={code} onChange={e=>setCode(e.target.value)}/>
                <button className="primary" type="button" onClick={suivre}>Consulter la décision</button>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
