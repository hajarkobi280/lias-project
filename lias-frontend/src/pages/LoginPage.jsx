import { useState } from 'react';
import api from '../services/api';

const LoginPage = ({ onLoginSuccess, onPublic }) => {
    const [form, setForm] = useState({ email: '', motDePasse: '' });
    const [erreur, setErreur] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErreur('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErreur('');
        try {
            const response = await api.post('/auth/login', form);
            const { id, token, nom, prenom, email, role, statut } = response.data;

            // Stocker le token et les infos utilisateur
            localStorage.setItem('lias_token', token);
            localStorage.setItem('lias_user', JSON.stringify({ id, nom, prenom, email, role, statut }));

            // Appeler le callback parent pour mettre à jour l'état global
            if (onLoginSuccess) onLoginSuccess({ id, nom, prenom, email, role, statut, token });

        } catch (error) {
            const msg = error.response?.data?.message || (!error.response ? 'Serveur inaccessible. Vérifie que le backend est démarré et que cette adresse est autorisée.' : error.response.status === 401 ? 'Email ou mot de passe incorrect.' : 'Connexion refusée par le serveur. Réessaie ou contacte un administrateur.');
            setErreur(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0b0f19',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif'
        }}>
            {/* Fond avec grille subtile */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <div style={{ position: 'relative', width: '100%', maxWidth: '420px', padding: '0 20px' }}>

                {/* Logo / Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '18px',
                        background: 'linear-gradient(135deg, #101e31, #183456)',
                        border: '1px solid #263a55',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', padding: '12px'
                    }}>
                        <img src="/lias-logo.png" alt="LIAS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 6px' }}>
                        Laboratoire LIAS
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                        Faculté des Sciences Ben M'Sik — Casablanca
                    </p>
                </div>

                {/* Carte formulaire */}
                <div style={{
                    background: '#111827',
                    border: '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '36px 32px'
                }}>
                    <h2 style={{ color: '#f1f5f9', fontSize: '1.1rem', fontWeight: '600', margin: '0 0 24px' }}>
                        Connexion au portail
                    </h2>

                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: '500',
                                color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.05em'
                            }}>
                                ADRESSE EMAIL
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="votre.email@lias.ma"
                                required
                                autoFocus
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#1e293b', border: '1px solid #334155',
                                    borderRadius: '8px', color: '#f1f5f9',
                                    fontSize: '0.95rem', outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#334155'}
                            />
                        </div>

                        {/* Mot de passe */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block', fontSize: '0.8rem', fontWeight: '500',
                                color: '#94a3b8', marginBottom: '6px', letterSpacing: '0.05em'
                            }}>
                                MOT DE PASSE
                            </label>
                            <input
                                type="password"
                                name="motDePasse"
                                value={form.motDePasse}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%', padding: '12px 14px',
                                    background: '#1e293b', border: '1px solid #334155',
                                    borderRadius: '8px', color: '#f1f5f9',
                                    fontSize: '0.95rem', outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = '#334155'}
                            />
                        </div>

                        {/* Message d'erreur */}
                        {erreur && (
                            <div style={{
                                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '8px', padding: '10px 14px',
                                color: '#f87171', fontSize: '0.85rem', marginBottom: '16px'
                            }}>
                                ⚠️ {erreur}
                            </div>
                        )}

                        {/* Bouton submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px',
                                background: loading ? '#1d4ed8aa' : '#2563eb',
                                color: '#fff', border: 'none', borderRadius: '8px',
                                fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.background = '#1d4ed8'; }}
                            onMouseLeave={e => { if (!loading) e.target.style.background = '#2563eb'; }}
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    {/* Aide */}
                    <div style={{
                        marginTop: '20px', paddingTop: '20px',
                        borderTop: '1px solid #1e293b',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#475569', fontSize: '0.8rem', margin: 0 }}>
                            Accès réservé aux membres du laboratoire LIAS.<br />
                            Contactez l'administrateur pour un compte.
                        </p>
                        <button type="button" onClick={onPublic} style={{ marginTop: '12px', padding: 0, border: 0, background: 'transparent', color: '#60a5fa', cursor: 'pointer' }}>Consulter le portail public</button>
                    </div>
                </div>

                {/* Footer */}
                <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.75rem', marginTop: '24px' }}>
                    Master Data Science & Big Data · 2025–2026
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
