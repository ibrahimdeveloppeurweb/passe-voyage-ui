import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'PASSE VOYAGE',
    isTitle: true
  },
  {
    label: 'Tableau de bord',
    icon: 'home',
    link: '/passe-voyage/dashboard',
    permission: 'MENU_DASHBOARD'
  },
  {
    label: 'Crédits & Billets',
    icon: 'credit-card',
    permission: 'MENU_PARENT_CREDITS_BILLETS',
    subItems: [
      { label: 'Demandes de Crédit', link: '/passe-voyage/credits/demandes', permission: 'MENU_CREDITS_DEMANDES' },
      { label: 'Billets Émis', link: '/passe-voyage/credits/billets', permission: 'MENU_CREDITS_BILLETS' },
      { label: 'Paramètres & Plafonds', link: '/passe-voyage/credits/parametres', permission: 'MENU_CREDITS_PARAMETRES' }
    ]
  },
  {
    label: 'Recouvrements',
    icon: 'dollar-sign',
    permission: 'MENU_PARENT_RECOUVREMENTS',
    subItems: [
      { label: 'Créances en cours', link: '/passe-voyage/recouvrement/creances', permission: 'MENU_RECOUVREMENTS_CREANCES' },
      { label: 'Paiements Reçus', link: '/passe-voyage/recouvrement/paiements', permission: 'MENU_RECOUVREMENTS_PAIEMENTS' },
      { label: 'Relances & Alertes', link: '/passe-voyage/recouvrement/relances', permission: 'MENU_RECOUVREMENTS_RELANCES' }
    ]
  },
  {
    label: 'Passagers',
    icon: 'users',
    permission: 'MENU_PARENT_PASSAGERS',
    subItems: [
      { label: 'Base Passagers', link: '/passe-voyage/passagers/base', permission: 'MENU_PASSAGERS_BASE' },
      { label: 'Historique Voyages', link: '/passe-voyage/passagers/historique', permission: 'MENU_PASSAGERS_HISTORIQUE' },
      { label: 'Blacklist (Bloqués)', link: '/passe-voyage/passagers/blacklist', permission: 'MENU_PASSAGERS_BLACKLIST' }
    ]
  },
  {
    label: 'Agents Terrain',
    icon: 'user-check',
    permission: 'MENU_PARENT_AGENTS',
    subItems: [
      { label: 'Annuaire', link: '/passe-voyage/agents-terrain/annuaire', permission: 'MENU_AGENTS_ANNUAIRE' },
      { label: 'Affectations', link: '/passe-voyage/agents-terrain/affectations', permission: 'MENU_AGENTS_AFFECTATIONS' },
      { label: 'Performances', link: '/passe-voyage/agents-terrain/performances', permission: 'MENU_AGENTS_PERFORMANCES' }
    ]
  },
  {
    label: 'Partenaires',
    icon: 'truck',
    permission: 'MENU_PARENT_PARTENAIRES',
    subItems: [
      { label: 'Compagnies', link: '/passe-voyage/partenaires/compagnies', permission: 'MENU_PARTENAIRES_COMPAGNIES' },
      { label: 'Fonds & Soldes', link: '/passe-voyage/partenaires/fonds', permission: 'MENU_PARTENAIRES_FONDS' },
      { label: 'Facturation', link: '/passe-voyage/partenaires/facturation', permission: 'MENU_PARTENAIRES_FACTURATION' }
    ]
  },
  {
    label: 'Gares & Tarifs',
    icon: 'map-pin',
    permission: 'MENU_PARENT_GARES',
    subItems: [
      { label: 'Villes & Gares', link: '/passe-voyage/referentiel/gares', permission: 'MENU_GARES_VILLES' },
      { label: 'Trajets', link: '/passe-voyage/referentiel/trajets', permission: 'MENU_GARES_TRAJETS' },
      { label: 'Grille Tarifaire', link: '/passe-voyage/referentiel/tarifs', permission: 'MENU_GARES_TARIFS' }
    ]
  },
  {
    label: 'Administration',
    icon: 'settings',
    permission: 'MENU_PARENT_ADMINISTRATION',
    subItems: [
      { label: 'Utilisateurs & Accès', link: '/passe-voyage/administration/users', permission: 'MENU_ADMINISTRATION_USERS' },
      { label: 'Rôles & Permissions', link: '/passe-voyage/administration/roles', permission: 'MENU_ADMINISTRATION_ROLES' },
      { label: 'Paramètres Globaux', link: '/passe-voyage/administration/settings', permission: 'MENU_ADMINISTRATION_SETTINGS' }
    ]
  },
  {
    label: 'ESPACE COMPAGNIE',
    isTitle: true
  },
  {
    label: 'Mon Tableau de bord',
    icon: 'pie-chart',
    link: '/espace-compagnie/dashboard',
    permission: 'MENU_COMPAGNIE_DASHBOARD'
  },
  {
    label: 'Activités & Gares',
    icon: 'activity',
    link: '/espace-compagnie/activites-gares',
    permission: 'MENU_COMPAGNIE_ACTIVITES_GARES'
  },
  {
    label: 'Billets Scannés',
    icon: 'check-square',
    link: '/espace-compagnie/billets-scannes',
    permission: 'MENU_COMPAGNIE_BILLETS_SCANNES'
  },
  {
    label: 'Solde & Finances',
    icon: 'briefcase',
    link: '/espace-compagnie/finances',
    permission: 'MENU_COMPAGNIE_FINANCES'
  }
];
