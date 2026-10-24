import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationsPage from './NotificationsPage';
import api from '../services/api';
vi.mock('../services/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
const notification = { id: 1, titre: 'Nouvel événement', message: 'Séminaire LIAS', lue: false, creeLe: '2026-10-08T10:00:00' };
beforeEach(() => { api.get.mockReset(); api.put.mockReset(); });
afterEach(cleanup);
describe('Notifications', () => {
 it('supporte StrictMode et la sortie de page sans erreur de nettoyage', async () => {
  api.get.mockResolvedValue({ data: [notification] });
  const count = vi.fn();
  const view = render(<StrictMode><NotificationsPage onUnreadChange={count}/></StrictMode>);
  expect(await screen.findByText('Séminaire LIAS')).toBeTruthy();
  expect(count).toHaveBeenCalledWith(1);
  expect(() => view.unmount()).not.toThrow();
 });
 it('affiche un état vide après le chargement', async () => {
  api.get.mockResolvedValue({ data: [] });render(<NotificationsPage/>);
  expect(await screen.findByText('Aucune notification pour le moment.')).toBeTruthy();
  expect(screen.queryByRole('status')).toBeNull();
 });
 it('signale une panne et permet de réessayer', async () => {
  api.get.mockRejectedValueOnce(new Error('Réseau')).mockResolvedValue({data:[notification]});
  render(<NotificationsPage/>);expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByText('Aucune notification pour le moment.')).toBeNull();
  fireEvent.click(screen.getByRole('button',{name:'Actualiser'}));
  expect(await screen.findByText('Séminaire LIAS')).toBeTruthy();expect(screen.queryByRole('alert')).toBeNull();
 });
 it('marque une notification comme lue et actualise le compteur', async () => {
  let read=false;api.get.mockImplementation(()=>Promise.resolve({data:[{...notification,lue:read}]}));
  api.put.mockImplementation(()=>{read=true;return Promise.resolve({data:{...notification,lue:true}});});
  const count=vi.fn();render(<NotificationsPage onUnreadChange={count}/>);
  fireEvent.click(await screen.findByRole('button',{name:'Marquer comme lue'}));
  expect(await screen.findByText('LUE')).toBeTruthy();expect(api.put).toHaveBeenCalledWith('/notifications/1/lue');
  expect(count).toHaveBeenLastCalledWith(0);expect(screen.queryByText('Marquer comme lue')).toBeNull();
 });
 it('conserve la notification non lue si la sauvegarde échoue', async () => {
  api.get.mockResolvedValue({data:[notification]});api.put.mockRejectedValue(new Error('Réseau'));render(<NotificationsPage/>);
  fireEvent.click(await screen.findByRole('button',{name:'Marquer comme lue'}));
  expect(await screen.findByRole('alert')).toBeTruthy();expect(screen.getByText('NOUVELLE')).toBeTruthy();
 });
 it('annule le chargement au départ et ignore une réponse tardive', async () => {
  let resolve;api.get.mockImplementation(()=>new Promise(r=>{resolve=r;}));const count=vi.fn();
  const view=render(<NotificationsPage onUnreadChange={count}/>);const signal=api.get.mock.calls[0][1].signal;
  view.unmount();expect(signal.aborted).toBe(true);
  await act(async()=>resolve({data:[notification]}));expect(count).not.toHaveBeenCalled();
 });
 it('désactive le bouton pendant la sauvegarde', async () => {
  api.get.mockResolvedValue({data:[notification]});let resolve;api.put.mockImplementation(()=>new Promise(r=>{resolve=r;}));render(<NotificationsPage/>);
  fireEvent.click(await screen.findByRole('button',{name:'Marquer comme lue'}));
  expect(screen.getByRole('button',{name:'Enregistrement…'}).disabled).toBe(true);
  await act(async()=>resolve({data:{}}));await waitFor(()=>expect(screen.queryByText('Enregistrement…')).toBeNull());
 });
});
