import { useState } from 'react';

const AppLayout = ({ children }) => {
    const [currentModule, setCurrentModule] = useState('membres');

    const navigationItems = [
        { id: 'dashboard', label: 'Vue Globale' },
        { id: 'membres', label: 'Matrice Chercheurs' },
        { id: 'gouvernance', label: 'Gouvernance & Mandats' },
        { id: 'equipes', label: 'Unités de Recherche' },
        { id: 'publications', label: 'Publications AI' },
    ];

    return (
        <div style={{ backgroundColor: '#030712', minHeight: '100vh', display: 'flex', color: '#f8fafc', fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
            
            {/* SIDEBAR FLOTTANTE HAUTE-PRÉCISION */}
            <aside style={{ width: '280px', backgroundColor: 'rgba(9, 13, 22, 0.5)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', padding: '30px 20px', position: 'sticky', top: 0, height: '100vh' }}>
                
               {/* Branding Cybernétique avec le vrai Logo */}
<div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '45px', paddingLeft: '5px' }}>
    <img 
        src="/lias-logo.png" 
        alt="Logo LIAS UH2C" 
        style={{ 
            width: '65px', 
            height: '65px', 
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' // Effet de lueur néon subtil
        }} 
    />
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Laboratoire d’Intelligence<br/> Artificielle et Systèmes
        </span>
        <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: '700', letterSpacing: '1px' }}>
            UH2C - FSBM
        </span>
    </div>
</div>

                {/* Navigation Principale */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {navigationItems.map((item) => {
                        const isActive = currentModule === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentModule(item.id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 18px', background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%)' : 'transparent', color: isActive ? '#818cf8' : '#94a3b8', border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: isActive ? '600' : '500', transition: 'all 0.2s', borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent' }}
                            >
                                <span style={{ fontSize: '18px', filter: isActive ? 'drop-shadow(0 0 8px #6366f1)' : 'none' }}>{item.icon}</span>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Profil Opérateur (Bas de menu) */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#34d399', boxShadow: '0 0 10px rgba(52, 211, 153, 0.2)' }}>
                        HK
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>Hajar Kobi</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Root Administrator</div>
                    </div>
                </div>
            </aside>

            {/* ZONE DE COMMANDE CENTRALE */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                
                {/* TOP HEADER COMMAND BAR */}
                <header style={{ height: '75px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(9, 13, 22, 0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, zIndex: 90 }}>
                    
                    {/* Recherche Holographique */}
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input 
                            type="text" 
                            placeholder="Rechercher un chercheur, un code, un mandat..." 
                            style={{ width: '100%', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', transition: 'all 0.3s' }}
                        />
                    </div>

                    {/* Meta-Informations Système */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block', boxShadow: '0 0 8px #6366f1' }} />
                            DB Core: Connected
                        </div>
                        <div style={{ fontSize: '18px', cursor: 'pointer', position: 'relative' }}>
                            🔔
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
                        </div>
                    </div>
                </header>

                {/* ESPACE D'INJECTION DE CONTENU (SCROLLABLE) */}
                <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#090d16' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;