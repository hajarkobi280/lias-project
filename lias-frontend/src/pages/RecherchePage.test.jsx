import {afterEach,expect,it,vi} from 'vitest';
import {cleanup,render,screen,fireEvent} from '@testing-library/react';
import RecherchePage from './RecherchePage';
import service from '../services/rechercheService';
vi.mock('../services/rechercheService',()=>({default:{rechercher:vi.fn()}}));
afterEach(cleanup);
it('lance la recherche par bouton et garde le terme des résultats',async()=>{
 service.rechercher.mockResolvedValue({total:1,membres:[{id:1,prenom:'Faouzia',nom:'Benabbou'}],elements:{}});
 render(<RecherchePage/>);
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'Faouzia Benabbou'}});
 fireEvent.click(screen.getByRole('button',{name:'Rechercher'}));
 expect(await screen.findByRole('heading',{name:'Faouzia Benabbou'})).toBeTruthy();
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'autre'}});
 expect(screen.getByText('1 résultat(s) pour « Faouzia Benabbou ».')).toBeTruthy();
});
it('affiche une erreur visible et permet de relancer',async()=>{
 service.rechercher.mockRejectedValue(new Error('Réseau'));render(<RecherchePage/>);
 fireEvent.change(screen.getByRole('textbox'),{target:{value:'test'}});
 fireEvent.click(screen.getByRole('button',{name:'Rechercher'}));
 expect(await screen.findByRole('alert')).toBeTruthy();
 expect(screen.getByRole('button',{name:'Rechercher'}).disabled).toBe(false);
});
