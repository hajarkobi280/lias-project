// Les affectations des membres et les mandats constituent l'annuaire des équipes.
// Une fiche éditoriale peut enrichir une équipe, sans dupliquer cet annuaire.
export function fusionnerEquipes(fiches, annuaire) {
  const cle = nom => (nom || '').trim().toLocaleLowerCase('fr');
  const resultat = fiches.map(fiche => {
    const equipe = annuaire.find(e => cle(e.nom) === cle(fiche.titre));
    return equipe && fiche.statut !== 'ARCHIVE'
      ? { ...fiche, responsable: equipe.chefEquipe || '', effectif: equipe.effectif, membres: equipe.membres || [] }
      : fiche;
  });
  for (const equipe of annuaire) {
    if (fiches.some(fiche => cle(fiche.titre) === cle(equipe.nom))) continue;
    resultat.push({ categorie: 'EQUIPES', titre: equipe.nom, statut: 'ACTIF',
      responsable: equipe.chefEquipe || '', effectif: equipe.effectif, membres: equipe.membres || [],
      description: '', depuisAnnuaire: true });
  }
  return resultat;
}
