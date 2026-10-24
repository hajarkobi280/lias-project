// Icônes ligne fine (inspirées du style Lucide) — aucune dépendance externe requise.
// Toutes acceptent une prop size (défaut 18) et héritent de la couleur du texte (currentColor).

const base = (size) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round',
});

export const IconUsers = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export const IconSearch = ({ size = 18 }) => (
  <svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
);

export const IconTeam = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);

export const IconCalendar = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);

export const IconCalendarDays = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>
);

export const IconFileText = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" /><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" /></svg>
);

export const IconArchive = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="2.5" y="4" width="19" height="4.5" rx="1" /><path d="M4 8.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5" /><path d="M10 13h4" /></svg>
);

export const IconCpu = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="6" y="6" width="12" height="12" rx="1.5" /><rect x="9.5" y="9.5" width="5" height="5" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></svg>
);

export const IconHandshake = ({ size = 18 }) => (
  <svg {...base(size)}><path d="m11 17 2 2a1.4 1.4 0 0 0 2-2 1.4 1.4 0 0 0 2-2 1.4 1.4 0 0 0 2-2l-3.1-3.1a2 2 0 0 0-2.8 0l-.7.7a2 2 0 0 1-2.8 0L6 8" /><path d="m21 3-3.5 3.5M3 21l3.5-3.5" /><path d="M6.5 6.5 3 10l6 6 1.4-1.4" /></svg>
);

export const IconClipboard = ({ size = 18 }) => (
  <svg {...base(size)}><rect x="6" y="4" width="12" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 11h6M9 15h6" /></svg>
);

export const IconMessageSquare = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>
);

export const IconBell = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
);

export const IconBarChart = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12.5" y="8" width="3" height="10" /><rect x="18" y="5" width="3" height="13" /></svg>
);

export const IconShieldCheck = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);

export const IconUserPlus = ({ size = 18 }) => (
  <svg {...base(size)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></svg>
);

export const IconLayers = ({ size = 18 }) => (
  <svg {...base(size)}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>
);

export const IconChevronDown = ({ size = 16 }) => (
  <svg {...base(size)}><path d="m6 9 6 6 6-6" /></svg>
);

export const IconLogOut = ({ size = 16 }) => (
  <svg {...base(size)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></svg>
);
