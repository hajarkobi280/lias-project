import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import api from './services/api';
vi.mock('./services/api',()=>({default:{get:vi.fn(),put:vi.fn(),post:vi.fn()}}));
const directeur={id:1,email:'directeur@test.fr',prenom:'Jean',nom:'Test',role:'DIRECTEUR',statut:'PERMANENT'};
function session(user=directeur){localStorage.setItem('lias_token','test-token');localStorage.setItem('lias_user',JSON.stringify(user));}
beforeEach(()=>{localStorage.clear();session();api.get.mockReset();api.get.mockImplementation(url=>Promise.resolve({data:url==='/auth/me'?directeur:[]}));});
afterEach(()=>{cleanup();localStorage.clear();});
describe('Navigation et session',()=>{
 it('limite le menu administrateur à la gestion technique',async()=>{
  const admin={...directeur,role:'ADMIN'};session(admin);
  api.get.mockImplementation(url=>Promise.resolve({data:url==='/auth/me'?admin:[]}));
  render(<App/>);await screen.findByRole('heading',{name:'Membres du laboratoire'});
  expect(screen.getByRole('button',{name:'Gouvernance & mandats',exact:true})).toBeTruthy();
  for(const name of ['Matériel & besoins','Adhésions','Événements','Rapport annuel','Archives documentaires','Publications'])
   expect(screen.queryByRole('button',{name,exact:true})).toBeNull();
 });
 it('ouvre les notifications puis revient aux membres sans page blanche',async()=>{
  render(<StrictMode><App/></StrictMode>);
  fireEvent.click(screen.getByRole('button',{name:'Notifications',exact:true}));
  expect(await screen.findByText('Aucune notification pour le moment.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Membres',exact:true}));
  expect(await screen.findByRole('heading',{name:'Membres du laboratoire'})).toBeTruthy();
 });
 it('déconnecte depuis les notifications et conserve la page de connexion au rechargement',async()=>{
  const view=render(<StrictMode><App/></StrictMode>);
  fireEvent.click(screen.getByRole('button',{name:'Notifications',exact:true}));await screen.findByText('Aucune notification pour le moment.');
  fireEvent.click(screen.getByRole('button',{name:'Déconnexion',exact:true}));
  expect(await screen.findByRole('heading',{name:'Connexion au portail'})).toBeTruthy();
  expect(localStorage.getItem('lias_token')).toBeNull();expect(localStorage.getItem('lias_user')).toBeNull();
  view.unmount();render(<App/>);expect(screen.getByRole('button',{name:'Se connecter'})).toBeTruthy();
 });
 it('une réponse auth/me tardive ne reconnecte pas après déconnexion',async()=>{
  let resolve;api.get.mockImplementation(url=>url==='/auth/me'?new Promise(r=>{resolve=r;}):Promise.resolve({data:[]}));
  render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Déconnexion',exact:true}));
  await act(async()=>resolve({data:directeur}));expect(screen.getByRole('heading',{name:'Connexion au portail'})).toBeTruthy();expect(localStorage.getItem('lias_user')).toBeNull();
 });
 it('revient à la connexion quand la session expire',async()=>{
  render(<App/>);await screen.findByRole('heading',{name:'Membres du laboratoire'});
  await act(async()=>{localStorage.clear();window.dispatchEvent(new Event('lias-session-expired'));});
  expect(screen.getByRole('button',{name:'Se connecter'})).toBeTruthy();
 });
 it('un stockage de session corrompu ne produit pas de page blanche',()=>{
  localStorage.setItem('lias_user','{invalide');render(<App/>);expect(screen.getByRole('button',{name:'Se connecter'})).toBeTruthy();
 });
 it('affiche notifications et déconnexion pour un doctorant',async()=>{
  const doctorant={...directeur,role:'MEMBRE_EQUIPE',statut:'DOCTORANT'};session(doctorant);api.get.mockImplementation(url=>Promise.resolve({data:url==='/auth/me'?doctorant:[]}));
  render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Notifications',exact:true}));await screen.findByText('Aucune notification pour le moment.');
  expect(screen.getByRole('button',{name:'Déconnexion',exact:true})).toBeTruthy();expect(screen.queryByRole('button',{name:'Gouvernance & mandats'})).toBeNull();
 });
 it.each([
  ['Équipes','Équipes de recherche'],['Événements','Événements scientifiques'],['Calendrier','Calendrier des événements'],
  ['Publications','Publications'],['Archives documentaires','Archives documentaires'],['Conventions','Conventions & collaborations'],
  ['Réunions & PV','Réunions & procès-verbaux'],['Rapport annuel','Rapport d’activité annuel'],['Recherche','Recherche globale'],
  ['Discussions','Discussions internes'],['Matériel & besoins','Matériel & besoins'],['Adhésions',"Demandes d'adhésion"],['Gouvernance & mandats','Gouvernance & mandats']
 ])('ouvre %s et permet de revenir aux notifications',async(label,titre)=>{
  render(<StrictMode><App/></StrictMode>);fireEvent.click(screen.getByRole('button',{name:label,exact:true}));
  expect(await screen.findByRole('heading',{name:titre,exact:true})).toBeTruthy();
  fireEvent.click(screen.getByRole('button',{name:'Notifications',exact:true}));expect(await screen.findByText('Aucune notification pour le moment.')).toBeTruthy();
 });
});
