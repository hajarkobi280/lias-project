import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import ElementPage from './ElementPage';
import elementService from '../services/elementService';
import api from '../services/api';
import { fusionnerEquipes } from '../services/equipes';
vi.mock('../services/elementService', () => ({default: {list: vi.fn(),update:vi.fn()}}));
vi.mock('../services/api', () => ({default: {get: vi.fn()}}));
afterEach(cleanup);
it('exclut les retraités et anciens des nouveaux organisateurs',async()=>{
 elementService.list.mockResolvedValue([{id:10,categorie:'EVENEMENTS',titre:'TEST',metadata:'{}'}]);
 api.get.mockResolvedValue({data:[{id:1,prenom:'Actif',nom:'Test',statutScientifique:'PERMANENT'},{id:2,prenom:'Retraité',nom:'Test',statutScientifique:'RETRAITE'},{id:3,prenom:'Ancien',nom:'Test',statutScientifique:'ANCIEN'}]});
 render(<ElementPage categorie="EVENEMENTS" titre="Événements" canManage user={{statut:'PERMANENT'}}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Modifier',exact:true}));
 expect(await screen.findByRole('checkbox',{name:'Actif Test'})).toBeTruthy();
 expect(screen.queryByRole('checkbox',{name:'Retraité Test'})).toBeNull();
 expect(screen.queryByRole('option',{name:'Retraité Test'})).toBeNull();
 expect(screen.queryByRole('checkbox',{name:'Ancien Test'})).toBeNull();
 expect(screen.queryByRole('option',{name:'Ancien Test'})).toBeNull();
});
it('permet de cocher plusieurs organisateurs, décocher et enregistrer la sélection',async()=>{
 elementService.list.mockResolvedValue([{id:10,categorie:'EVENEMENTS',titre:'TEST événement',metadata:JSON.stringify({organisateurs:[1]})}]);
 elementService.update.mockResolvedValue({});
 api.get.mockResolvedValue({data:[{id:1,prenom:'Sara',nom:'Ouahabi'},{id:2,prenom:'Driss',nom:'Bouggar'},{id:3,prenom:'Amal',nom:'Zaouch'}]});
 render(<ElementPage categorie="EVENEMENTS" titre="Événements" canManage user={{statut:'PERMANENT'}}/>);
 fireEvent.click(await screen.findByRole('button',{name:'Modifier',exact:true}));
 const sara=await screen.findByRole('checkbox',{name:'Sara Ouahabi'});
 expect(sara.checked).toBe(true);
 fireEvent.click(screen.getByRole('checkbox',{name:'Driss Bouggar'}));
 fireEvent.click(screen.getByRole('checkbox',{name:'Amal Zaouch'}));
 expect(screen.getByText('3 sélectionné(s)')).toBeTruthy();
 fireEvent.click(sara);
 fireEvent.click(screen.getByRole('button',{name:'Enregistrer'}));
 await waitFor(()=>expect(elementService.update).toHaveBeenCalled());
 expect(JSON.parse(elementService.update.mock.calls.at(-1)[1].metadata).organisateurs).toEqual(['2','3']);
});
const annuaire = [{nom: 'ISDIAC', chefEquipe: 'Nawal Sael', effectif: 4}, {nom: 'ILIAS', chefEquipe: 'Abdelaziz Ettaoufik', effectif: 4}];
it('affiche les équipes et chefs issus de la base sans fiches éditoriales', async () => {
  elementService.list.mockResolvedValue([]);
  api.get.mockResolvedValue({data: annuaire});
  render(<ElementPage categorie="EQUIPES" titre="Équipes" canManage user={{statut:'PERMANENT'}}/>);
  expect(await screen.findByText('Nawal Sael')).toBeTruthy();
  expect(screen.getByText('Abdelaziz Ettaoufik')).toBeTruthy();
  expect(screen.queryByText('Aucun élément à afficher.')).toBeNull();
  expect(screen.queryByRole('button', {name:'Historique'})).toBeNull();
  expect(screen.queryByRole('button', {name:'Archiver'})).toBeNull();
  fireEvent.change(screen.getByPlaceholderText('Rechercher dans équipes...'), {target:{value:'Nawal'}});
  expect(screen.getByText('ISDIAC')).toBeTruthy();
  expect(screen.queryByText('ILIAS')).toBeNull();
});
it('enrichit une fiche existante sans doublon et utilise le mandat actuel', () => {
  const result = fusionnerEquipes([{id:1,titre:' isdiac ',description:'Présentation',responsable:'Ancien chef'}], annuaire);
  expect(result).toHaveLength(2);
  expect(result[0]).toMatchObject({id:1,description:'Présentation',responsable:'Nawal Sael',effectif:4});
});
it('ne réactive pas une fiche archivée et ne conserve pas un chef expiré', () => {
  expect(fusionnerEquipes([{id:1,titre:'ISDIAC',statut:'ARCHIVE'}], annuaire)[0].statut).toBe('ARCHIVE');
  expect(fusionnerEquipes([{id:1,titre:'ISDIAC',responsable:'Ancien'}], [{nom:'ISDIAC',chefEquipe:null,effectif:2}])[0].responsable).toBe('');
});
