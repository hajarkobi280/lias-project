import { useEffect, useState } from 'react';
import api from '../services/api';
export default function ParametresPage(){
 const [form,setForm]=useState(null),[message,setMessage]=useState('');
 useEffect(()=>{api.get('/public/laboratoire').then(r=>setForm(r.data)).catch(()=>setMessage('Paramètres indisponibles.'));},[]);
 const save=async e=>{e.preventDefault();try{await api.put('/laboratoire',form);setMessage('Paramètres enregistrés.');}catch(err){setMessage(err.response?.data?.message||'Enregistrement impossible.');}};
 return <section className="page"><h1>Paramètres du laboratoire</h1><p>Présentation publique et date de création officielle.</p>{message&&<p className="notice">{message}</p>}{form&&<form className="card" onSubmit={save}><label>Nom<input required value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}/></label><label>Date de création<input type="date" required value={form.dateCreation||''} onChange={e=>setForm({...form,dateCreation:e.target.value})}/></label><label>Présentation<textarea value={form.presentation||''} onChange={e=>setForm({...form,presentation:e.target.value})}/></label><button className="primary">Enregistrer</button></form>}</section>;
}
