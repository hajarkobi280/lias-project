// src/services/authService.js

const TOKEN_KEY  = 'lias_token';
const USER_KEY   = 'lias_user';

const authService = {

    // Récupérer le token stocké
    getToken: () => localStorage.getItem(TOKEN_KEY),

    // Récupérer l'utilisateur connecté
    getUser: () => {
        if (!localStorage.getItem(TOKEN_KEY)) return null;
        try {
            const user = JSON.parse(localStorage.getItem(USER_KEY));
            return user && typeof user.email === 'string' ? user : null;
        } catch {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
    },

    // Vérifier si connecté
    isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

    // Vérifier le rôle
    hasRole: (role) => {
        const user = authService.getUser();
        return user?.role === role;
    },

    isDirecteur: () => authService.hasRole('DIRECTEUR'),

    // Déconnexion
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Injecter le token dans les headers Axios
    getAuthHeader: () => {
        const token = authService.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
};

export default authService;