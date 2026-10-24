import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import api from './api';
beforeEach(()=>{localStorage.clear();localStorage.setItem('lias_token','token-courant');localStorage.setItem('lias_user','{"email":"test@lias.fr"}');});
afterEach(()=>{localStorage.clear();vi.restoreAllMocks();});
it('une réponse 401 de la session courante efface la session et signale son expiration',async()=>{
 const event=vi.spyOn(window,'dispatchEvent');
 await expect(api.get('/notifications',{adapter:config=>Promise.reject({config,response:{status:401}})})).rejects.toBeDefined();
 expect(localStorage.getItem('lias_token')).toBeNull();expect(event).toHaveBeenCalledWith(expect.objectContaining({type:'lias-session-expired'}));
});
it('une réponse tardive 401 de l’ancien compte ne déconnecte pas le nouveau',async()=>{
 let reject;let ancienneConfig;
 const request=api.get('/notifications',{adapter:config=>{ancienneConfig=config;return new Promise((resolve,rejectRequest)=>{reject=rejectRequest;});}});
 const rejected=expect(request).rejects.toBeDefined();
 await vi.waitFor(()=>expect(reject).toBeTypeOf('function'));
 localStorage.setItem('lias_token','nouveau-token');
 reject({config:ancienneConfig,response:{status:401}});await rejected;
 expect(localStorage.getItem('lias_token')).toBe('nouveau-token');
});
it('un échec de connexion reste traité par le formulaire',async()=>{
 const event=vi.spyOn(window,'dispatchEvent');
 await expect(api.post('/auth/login',{}, {adapter:config=>Promise.reject({config,response:{status:401}})})).rejects.toBeDefined();
 expect(event).not.toHaveBeenCalled();
});
