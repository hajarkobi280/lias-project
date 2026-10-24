import { useEffect, useMemo, useState } from 'react';
import elementService from '../services/elementService';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function construireGrille(annee, mois) {
  const premierJour = new Date(annee, mois, 1);
  const decalage = (premierJour.getDay() + 6) % 7; // lundi = 0
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases = [];
  for (let i = 0; i < decalage; i++) cases.push(null);
  for (let jour = 1; jour <= nbJours; jour++) cases.push(jour);
  while (cases.length % 7 !== 0) cases.push(null);
  return cases;
}

export default function CalendrierPage() {
  const [evenements, setEvenements] = useState([]);
  const [reference, setReference] = useState(new Date());
  const [jourSelectionne, setJourSelectionne] = useState(null);

  useEffect(() => { elementService.list('EVENEMENTS').then(setEvenements).catch(() => setEvenements([])); }, []);

  const annee = reference.getFullYear();
  const mois = reference.getMonth();
  const grille = useMemo(() => construireGrille(annee, mois), [annee, mois]);

  const evenementsParJour = useMemo(() => {
    const map = {};
    evenements.forEach((ev) => {
      if (!ev.dateDebut) return;
      const debut = ev.dateDebut;
      const fin = ev.dateFin || debut;
      for (let jour=1;jour<=new Date(annee,mois+1,0).getDate();jour++) {
        const date=`${annee}-${String(mois+1).padStart(2,'0')}-${String(jour).padStart(2,'0')}`;
        if(date>=debut && date<=fin)(map[jour] ||= []).push(ev);
      }
    });
    return map;
  }, [evenements, annee, mois]);

  const changerMois = (delta) => { setReference(new Date(annee, mois + delta, 1)); setJourSelectionne(null); };
  const evenementsDuJour = jourSelectionne ? (evenementsParJour[jourSelectionne] || []) : [];

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Module LIAS</p>
          <h1>Calendrier des événements</h1>
          <p>Navigation mois par mois à travers les activités du laboratoire.</p>
        </div>
        <div className="actions">
          <button onClick={() => changerMois(-1)}>← Mois précédent</button>
          <strong style={{ alignSelf: 'center' }}>{MOIS[mois]} {annee}</strong>
          <button onClick={() => changerMois(1)}>Mois suivant →</button>
        </div>
      </div>

      <div className="calendar-grid">
        {JOURS.map((j) => <div className="calendar-dow" key={j}>{j}</div>)}
        {grille.map((jour, idx) => (
          <div
            key={idx}
            className={`calendar-cell ${jour ? '' : 'empty'} ${jour === jourSelectionne ? 'selected' : ''}`}
            onClick={() => jour && setJourSelectionne(jour)}
          >
            {jour && <>
              <span className="calendar-day-num">{jour}</span>
              {(evenementsParJour[jour] || []).slice(0, 2).map((ev) => (
                <span className="calendar-event-chip" key={ev.id}>{ev.titre}</span>
              ))}
              {(evenementsParJour[jour] || []).length > 2 && <span className="calendar-event-more">+{evenementsParJour[jour].length - 2}</span>}
            </>}
          </div>
        ))}
      </div>

      {jourSelectionne && (
        <>
          <h2>{jourSelectionne} {MOIS[mois]} {annee}</h2>
          <div className="cards">
            {evenementsDuJour.map((ev) => (
              <article className="card" key={ev.id}>
                <span className="badge">{ev.statut || 'ACTIF'}</span>
                <h2>{ev.titre}</h2>
                <p>{ev.description || 'Aucune description.'}</p>
                <dl><dt>Responsable</dt><dd>{ev.responsable || 'Non attribué'}</dd></dl>
              </article>
            ))}
            {!evenementsDuJour.length && <div className="empty">Aucun événement ce jour-là.</div>}
          </div>
        </>
      )}
    </section>
  );
}
