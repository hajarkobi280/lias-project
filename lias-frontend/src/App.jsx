import { useEffect, useState } from 'react';
import {
  Users, Search, Mail, ShieldCheck, Boxes, CalendarDays,
  BookOpen, Archive, Monitor, Handshake, FileText, MessageSquare,
  Bell, TrendingUp, LogOut,
} from 'lucide-react';
import LoginPage from './pages/LoginPage';
import MembresPage from './pages/MembresPage';
import ElementPage from './pages/ElementPage';
import PublicPage from './pages/PublicPage';
import NotificationsPage from './pages/NotificationsPage';
import AdhesionsPage from './pages/AdhesionsPage';
import GouvernancePage from './pages/GouvernancePage';
import RecherchePage from './pages/RecherchePage';
import CalendrierPage from './pages/CalendrierPage';
import CommunicationPage from './pages/CommunicationPage';
import MaterielPage from './pages/MaterielPage';
import authService from './services/authService';
import RapportPage from './pages/RapportPage';
import ParametresPage from './pages/ParametresPage';
import api from './services/api';

// Navigation groupée par section, avec icône professionnelle par module
const NAV_SECTIONS = [
  {
    label: 'Espace de travail',
    items: [
      ['membres', 'Membres', Users],
      ['equipes', 'Équipes', Boxes],
      ['evenements', 'Événements', CalendarDays],
      ['calendrier', 'Calendrier', CalendarDays],
      ['publications', 'Publications', BookOpen],
      ['documents', 'Archives documentaires', Archive],
      ['conventions', 'Conventions', Handshake],
      ['pv', 'Réunions & PV', FileText],
      ['rapport', 'Rapport annuel', TrendingUp],
    ],
  },
  {
    label: 'Collaboration',
    items: [
      ['recherche', 'Recherche', Search],
      ['discussions', 'Discussions', MessageSquare],
      ['notifications', 'Notifications', Bell],
      ['materiel', 'Matériel & besoins', Monitor],
    ],
  },
  {
    label: 'Administration',
    items: [
      ['parametres', 'Paramètres du laboratoire', ShieldCheck],
      ['adhesions', 'Adhésions', Mail],
      ['gouvernance', 'Gouvernance & mandats', ShieldCheck],
    ],
  },
];

const PAGE_TITLES = {
  membres: 'Membres', recherche: 'Recherche', adhesions: 'Adhésions',
  gouvernance: 'Gouvernance & mandats', equipes: 'Équipes', evenements: 'Événements',
  calendrier: 'Calendrier', publications: 'Publications', documents: 'Archives documentaires',
  materiel: 'Matériel & besoins', conventions: 'Conventions', pv: 'Réunions & PV',
  parametres: 'Paramètres du laboratoire', discussions: 'Discussions', notifications: 'Notifications', rapport: 'Rapport annuel',
};

const PAGE_DETAILS = {
  adhesions: ['Demandes d’adhésion', 'Soumission, décision et traçabilité des candidatures.'],
  gouvernance: ['Gouvernance & mandats', 'Mandats du directeur, vice-directeur et chefs d’équipe.'],
  equipes: ['Équipes de recherche', 'Organisation des unités de recherche et responsables.'],
  evenements: ['Événements scientifiques', 'Conférences, séminaires, workshops et leurs éditions.'],
  calendrier: ['Calendrier des événements', 'Visualisation chronologique des activités du laboratoire.'],
  publications: ['Publications', 'Publications des membres et doctorants, classées et consultables.'],
  documents: ['Archives documentaires', 'Programmes, attestations, rapports et documents administratifs.'],
  materiel: ['Matériel & besoins', 'Arrivages, distribution, demandes et historique.'],
  conventions: ['Conventions & collaborations', 'Partenaires, conventions et activités associées.'],
  pv: ['Réunions & procès-verbaux', 'Ordres du jour, PV et archivage des réunions.'],
  discussions: ['Discussions internes', 'Échanges entre membres, équipes et événements.'],
};

const initiales = (user) => `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase();
const libelleRole = (role) => role ? role.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()) : '';

function App() {
  const [user, setUser] = useState(() => authService.getUser());
  const [page, setPage] = useState(() => authService.getUser()?.statut === 'DOCTORANT' ? 'publications' : 'membres');
  const [publicMode, setPublicMode] = useState(false);
  const [profilRequest, setProfilRequest] = useState(0);
  const ouvrirProfil = () => {setPage('membres');setProfilRequest(n=>n+1);};
  const profilEnregistre = patch => {setUser(current=>{const next={...current,...patch};localStorage.setItem('lias_user',JSON.stringify(next));return next;});};
  const [nonLues, setNonLues] = useState(0);
  const logout = () => {
    authService.logout();
    setUser(null);
    setPage('membres');
    setPublicMode(false);
    setNonLues(0);
  };

  const email = user?.email;
  useEffect(() => {
    if (!email) return;
    const controller = new AbortController();
    const token = authService.getToken();
    const actualiser = () => api.get('/notifications', { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted && authService.getToken() === token) setNonLues(data.filter(n => !n.lue).length);
      }).catch(() => {});
    actualiser();
    const timer = window.setInterval(actualiser, 30000);
    window.addEventListener('focus', actualiser);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', actualiser); };
  }, [email, page]);

  useEffect(() => {
    const expire = () => { setUser(null); setNonLues(0); };
    window.addEventListener('lias-session-expired', expire);
    const token = authService.getToken();
    const controller = new AbortController();
    if (token) api.get('/auth/me', { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted || authService.getToken() !== token) return;
      localStorage.setItem('lias_user', JSON.stringify(data));
      setUser(data);
    }).catch(() => {});
    return () => { controller.abort(); window.removeEventListener('lias-session-expired', expire); };
  }, [page]);

  if (publicMode) return <PublicPage onBack={() => setPublicMode(false)} />;
  if (!user) return <LoginPage onLoginSuccess={u => {setUser(u);setPage(u.statut === 'DOCTORANT' ? 'publications' : 'membres');}} onPublic={() => setPublicMode(true)} />;

  const canManage = ['DIRECTEUR', 'ADMIN'].includes(user.role);
  const estAdmin = user.role === 'ADMIN';
  const interne = !estAdmin && (!['DOCTORANT','ASSOCIE'].includes(user.statut) || canManage);
  const estDoctorant = user.statut === 'DOCTORANT';
  const sectionsVisibles = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(([id]) => { if(estAdmin)return ['membres','gouvernance','parametres','notifications'].includes(id); if(id === 'notifications')return true; if(id === 'parametres')return user.role === 'ADMIN'; if(id === 'adhesions')return user.role === 'DIRECTEUR'; if(estDoctorant)return ['membres','publications'].includes(id); if(!interne)return ['membres','equipes','evenements','calendrier','publications'].includes(id); return true; }),
  })).filter(section => section.items.length > 0);

  let content;
  if (estAdmin && !['membres','gouvernance','parametres','notifications'].includes(page)) content = <MembresPage user={user} />;
  else if (estDoctorant && !['membres','publications','notifications'].includes(page)) {
    content = <section className="page"><div className="page-head"><div><p className="eyebrow">Accès restreint</p><h1>Module non accessible</h1><p>Les comptes doctorants n'ont pas accès à ce module interne.</p></div></div></section>;
  }
  else if (page === 'parametres') content = <ParametresPage />;
  else if (page === 'membres') content = <MembresPage user={user} profilRequest={profilRequest} onProfileSaved={profilEnregistre} onProfileClose={()=>setProfilRequest(0)} />;
  else if (page === 'notifications') content = <NotificationsPage key={user.email} onUnreadChange={setNonLues} />;
  else if (page === 'adhesions') content = <AdhesionsPage isDirecteur={user.role === 'DIRECTEUR'} />;
  else if (page === 'gouvernance') content = <GouvernancePage canManage={['DIRECTEUR', 'ADMIN'].includes(user.role)} />;
  else if (page === 'recherche') content = <RecherchePage />;
  else if (page === 'calendrier') content = <CalendrierPage />;
  else if (page === 'discussions') content = <CommunicationPage />;
  else if (page === 'materiel') content = <MaterielPage canManage={user.role === 'DIRECTEUR'} user={user} />;
  else if (page === 'rapport') content = <RapportPage />;
  else { const [titre, aide] = PAGE_DETAILS[page]; content = <ElementPage categorie={page === 'calendrier' ? 'EVENEMENTS' : page.toUpperCase()} titre={titre} aide={aide} canManage={interne || page === 'publications'} user={user} key={page} />; }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/lias-logo.png" alt="LIAS" />
          <div><strong>LIAS</strong><span>Laboratoire IA &amp; Systèmes</span></div>
        </div>
        <nav>
          {sectionsVisibles.map(section => (
            <div className="nav-section" key={section.label}>
              <p className="nav-section-label">{section.label}</p>
              {section.items.map(([id, label, Icon]) => (
                <button className={page === id ? 'active' : ''} onClick={() => setPage(id)} key={id}>
                  <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="account">
          <div className="avatar">{user.photoUrl ? <img src={user.photoUrl} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/> : initiales(user)}</div>
          <div><strong>{user.prenom} {user.nom}</strong><span>{libelleRole(user.role)}</span></div>
          <button onClick={logout} title="Déconnexion" aria-label="Déconnexion du compte"><LogOut size={16} strokeWidth={1.8} /></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="breadcrumb"><span>LIAS</span><span className="sep">/</span><strong>{PAGE_TITLES[page] || 'Tableau de bord'}</strong></div>
          <div className="topbar-actions">
            {interne && <button className="global-search-button" onClick={() => setPage('recherche')}><Search size={16} aria-hidden="true"/>Rechercher</button>}
            <button className="icon-btn" onClick={() => setPage('notifications')} title="Notifications" aria-label={`Notifications${nonLues ? `, ${nonLues} non lues` : ", aucune non lue"}`}>
              <Bell size={18} strokeWidth={1.8} />
              {nonLues > 0 && <span className="notification-count" aria-hidden="true">{nonLues}</span>}
            </button>
            <button className="topbar-account" onClick={ouvrirProfil} aria-label="Modifier mon profil" title="Modifier mon profil">
              <div className="avatar small">{user.photoUrl ? <img src={user.photoUrl} alt="" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/> : initiales(user)}</div>
              <div><strong>{user.prenom} {user.nom}</strong><span>{libelleRole(user.role)}</span></div>
            </button>
            <button className="logout-button" onClick={logout}><LogOut size={16} aria-hidden="true" />Déconnexion</button>
          </div>
        </header>
        {content}
      </main>
    </div>
  );
}

export default App;
