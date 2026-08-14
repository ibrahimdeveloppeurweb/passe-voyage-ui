import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'PASSE VOYAGE',
    isTitle: true
  },
  {
    label: 'Tableau de bord',
    icon: 'home',
    link: '/passe-voyage/dashboard'
  },
  {
    label: 'Crédits & Billets',
    icon: 'credit-card',
    subItems: [
      {
        label: 'Demandes de Crédit',
        link: '/passe-voyage/credits/demandes',
      },
      {
        label: 'Billets Émis',
        link: '/passe-voyage/credits/billets',
      },
      {
        label: 'Paramètres & Plafonds',
        link: '/passe-voyage/credits/parametres',
      }
    ]
  },
  {
    label: 'Recouvrements',
    icon: 'dollar-sign',
    subItems: [
      {
        label: 'Créances en cours',
        link: '/passe-voyage/recouvrement/creances',
      },
      {
        label: 'Paiements Reçus',
        link: '/passe-voyage/recouvrement/paiements',
      },
      {
        label: 'Relances & Alertes',
        link: '/passe-voyage/recouvrement/relances',
      }
    ]
  },
  {
    label: 'Passagers',
    icon: 'users',
    subItems: [
      {
        label: 'Base Passagers',
        link: '/passe-voyage/passagers/base',
      },
      {
        label: 'Historique Voyages',
        link: '/passe-voyage/passagers/historique',
      },
      {
        label: 'Blacklist (Bloqués)',
        link: '/passe-voyage/passagers/blacklist',
      }
    ]
  },
  {
    label: 'Agents Terrain',
    icon: 'user-check',
    subItems: [
      {
        label: 'Annuaire',
        link: '/passe-voyage/agents-terrain/annuaire',
      },
      {
        label: 'Affectations',
        link: '/passe-voyage/agents-terrain/affectations',
      },
      {
        label: 'Performances',
        link: '/passe-voyage/agents-terrain/performances',
      }
    ]
  },
  {
    label: 'Partenaires',
    icon: 'truck',
    subItems: [
      {
        label: 'Compagnies',
        link: '/passe-voyage/partenaires/compagnies',
      },
      {
        label: 'Fonds & Soldes',
        link: '/passe-voyage/partenaires/fonds',
      },
      {
        label: 'Facturation',
        link: '/passe-voyage/partenaires/facturation',
      }
    ]
  },
  {
    label: 'Gares & Tarifs',
    icon: 'map-pin',
    subItems: [
      {
        label: 'Villes & Gares',
        link: '/passe-voyage/referentiel/gares',
      },
      {
        label: 'Trajets',
        link: '/passe-voyage/referentiel/trajets',
      },
      {
        label: 'Grille Tarifaire',
        link: '/passe-voyage/referentiel/tarifs',
      }
    ]
  },
  {
    label: 'Administration',
    icon: 'settings',
    subItems: [
      {
        label: 'Utilisateurs & Accès',
        link: '/passe-voyage/administration/users',
      },
      {
        label: 'Rôles & Permissions',
        link: '/passe-voyage/administration/roles',
      },
      {
        label: 'Paramètres Globaux',
        link: '/passe-voyage/administration/settings',
      }
    ]
  }
];
