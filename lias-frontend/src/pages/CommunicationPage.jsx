import { useCallback, useEffect, useState } from 'react';
import messageService from '../services/messageService';
import elementService from '../services/elementService';

const FILS_DE_BASE = ['GENERAL'];
const libelleFil = (fil) => {
  if (fil === 'GENERAL') return 'Discussion générale';
  if (fil.startsWith('EQUIPE:')) return `Équipe ${fil.slice(7)}`;
  if (fil.startsWith('EVENEMENT:')) return `Événement #${fil.slice(10)}`;
  return fil;
};

export default function CommunicationPage() {
  const [fils, setFils] = useState(FILS_DE_BASE);
  const [filActif, setFilActif] = useState('GENERAL');
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const [nouveauFil, setNouveauFil] = useState('');
  const [evenements,setEvenements]=useState([]);
  const [erreur,setErreur]=useState('');
  useEffect(()=>{elementService.list('EVENEMENTS').then(setEvenements).catch(()=>setErreur('Événements indisponibles.'));},[]);

  useEffect(() => {
    messageService.fils().then((liste) => setFils([...new Set([...FILS_DE_BASE, ...liste])])).catch(() => {});
  }, []);

  const charger = useCallback((fil) => {
    messageService.lister(fil).then(setMessages).catch(() => setMessages([]));
  }, []);

  useEffect(() => { charger(filActif); }, [filActif, charger]);

  const envoyer = async (event) => {
    event.preventDefault();
    if (!texte.trim()) return;
    try {await messageService.poster(filActif, texte);setTexte('');charger(filActif);setErreur('');}catch{setErreur('Le message n’a pas pu être envoyé.');}
  };

  const creerFil = () => {
    const nom = nouveauFil.trim();
    if (!nom) return;
    const id = `EQUIPE:${nom}`;
    setFils((f) => [...new Set([...f, id])]);
    setFilActif(id);
    setNouveauFil('');
  };

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Module LIAS</p>
          <h1>Discussions internes</h1>
          <p>Échanges par équipe, par événement ou en discussion générale.</p>
        </div>
      </div>

      {erreur&&<p className="notice">{erreur}</p>}<div className="comm-layout">
        <aside className="comm-fils">
          {fils.map((fil) => (
            <button key={fil} className={fil === filActif ? 'active' : ''} onClick={() => setFilActif(fil)}>
              {libelleFil(fil)}
            </button>
          ))}
          <label>Discussion d’un événement<select value={filActif.startsWith('EVENEMENT:')?filActif:''} onChange={e=>{if(e.target.value){setFilActif(e.target.value);setFils(f=>[...new Set([...f,e.target.value])]);}}}><option value="">Choisir un événement</option>{evenements.map(ev=><option key={ev.id} value={`EVENEMENT:${ev.id}`}>{ev.titre}</option>)}</select></label>
          <div className="comm-new-fil">
            <input placeholder="Nom d'équipe..." value={nouveauFil} onChange={(e) => setNouveauFil(e.target.value)} />
            <button onClick={creerFil}>+ Fil équipe</button>
          </div>
        </aside>

        <div className="comm-thread">
          <div className="comm-messages">
            {messages.map((m) => (
              <div className="comm-message" key={m.id}>
                <strong>{m.auteur?.prenom} {m.auteur?.nom}</strong>
                <span className="comm-date">{new Date(m.creeLe).toLocaleString('fr-FR')}</span>
                <p>{m.contenu}</p>
              </div>
            ))}
            {!messages.length && <div className="empty">Aucun message dans ce fil pour l'instant.</div>}
          </div>
          <form className="comm-form" onSubmit={envoyer}>
            <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Écrire un message..." />
            <button className="primary" type="submit">Envoyer</button>
          </form>
        </div>
      </div>
    </section>
  );
}
