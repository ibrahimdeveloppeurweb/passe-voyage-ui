import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { CreditsComponent } from './credits/credits.component';
import { RecouvrementComponent } from './recouvrement/recouvrement.component';
import { PassagersComponent } from './passagers/passagers.component';
import { AgentsTerrainComponent } from './agents-terrain/agents-terrain.component';
import { PartenairesComponent } from './partenaires/partenaires.component';
import { ReferentielComponent } from './referentiel/referentiel.component';
import { AdministrationComponent } from './administration/administration.component';
import { AdminUsersComponent } from './administration/admin-users/admin-users.component';
import { AdminRolesComponent } from './administration/admin-roles/admin-roles.component';
import { AdminSettingsComponent } from './administration/admin-settings/admin-settings.component';
import { RefGaresComponent } from './referentiel/ref-gares/ref-gares.component';
import { RefTrajetsComponent } from './referentiel/ref-trajets/ref-trajets.component';
import { RefTarifsComponent } from './referentiel/ref-tarifs/ref-tarifs.component';
import { PartCompagniesComponent } from './partenaires/part-compagnies/part-compagnies.component';
import { PartFondsComponent } from './partenaires/part-fonds/part-fonds.component';
import { PartFacturationComponent } from './partenaires/part-facturation/part-facturation.component';
import { AgentAnnuaireComponent } from './agents-terrain/agent-annuaire/agent-annuaire.component';
import { AgentAffectationsComponent } from './agents-terrain/agent-affectations/agent-affectations.component';
import { AgentPerformancesComponent } from './agents-terrain/agent-performances/agent-performances.component';
import { PassBaseComponent } from './passagers/pass-base/pass-base.component';
import { PassHistoriqueComponent } from './passagers/pass-historique/pass-historique.component';
import { PassBlacklistComponent } from './passagers/pass-blacklist/pass-blacklist.component';
import { RecCreancesComponent } from './recouvrement/rec-creances/rec-creances.component';
import { RecPaiementsComponent } from './recouvrement/rec-paiements/rec-paiements.component';
import { RecRelancesComponent } from './recouvrement/rec-relances/rec-relances.component';
import { CredDemandesComponent } from './credits/cred-demandes/cred-demandes.component';
import { CredBilletsComponent } from './credits/cred-billets/cred-billets.component';
import { CredParametresComponent } from './credits/cred-parametres/cred-parametres.component';

export const passeVoyageRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Tableau de bord - Passe Voyage'
  },
  {
    path: 'credits',
    component: CreditsComponent,
    children: [
      {
        path: '',
        redirectTo: 'demandes',
        pathMatch: 'full'
      },
      {
        path: 'demandes',
        component: CredDemandesComponent,
        title: 'Demandes de Crédit - Passe Voyage'
      },
      {
        path: 'billets',
        component: CredBilletsComponent,
        title: 'Billets Émis - Passe Voyage'
      },
      {
        path: 'parametres',
        component: CredParametresComponent,
        title: 'Paramètres Crédits - Passe Voyage'
      }
    ]
  },
  {
    path: 'recouvrement',
    component: RecouvrementComponent,
    children: [
      {
        path: '',
        redirectTo: 'creances',
        pathMatch: 'full'
      },
      {
        path: 'creances',
        component: RecCreancesComponent,
        title: 'Créances en cours - Passe Voyage'
      },
      {
        path: 'paiements',
        component: RecPaiementsComponent,
        title: 'Paiements Reçus - Passe Voyage'
      },
      {
        path: 'relances',
        component: RecRelancesComponent,
        title: 'Relances - Passe Voyage'
      }
    ]
  },
  {
    path: 'passagers',
    component: PassagersComponent,
    children: [
      {
        path: '',
        redirectTo: 'base',
        pathMatch: 'full'
      },
      {
        path: 'base',
        component: PassBaseComponent,
        title: 'Base Passagers - Passe Voyage'
      },
      {
        path: 'historique',
        component: PassHistoriqueComponent,
        title: 'Historique Voyages - Passe Voyage'
      },
      {
        path: 'blacklist',
        component: PassBlacklistComponent,
        title: 'Blacklist - Passe Voyage'
      }
    ]
  },
  {
    path: 'agents-terrain',
    component: AgentsTerrainComponent,
    children: [
      {
        path: '',
        redirectTo: 'annuaire',
        pathMatch: 'full'
      },
      {
        path: 'annuaire',
        component: AgentAnnuaireComponent,
        title: 'Annuaire des Agents - Passe Voyage'
      },
      {
        path: 'affectations',
        component: AgentAffectationsComponent,
        title: 'Affectations - Passe Voyage'
      },
      {
        path: 'performances',
        component: AgentPerformancesComponent,
        title: 'Performances - Passe Voyage'
      }
    ]
  },
  {
    path: 'partenaires',
    component: PartenairesComponent,
    children: [
      {
        path: '',
        redirectTo: 'compagnies',
        pathMatch: 'full'
      },
      {
        path: 'compagnies',
        component: PartCompagniesComponent,
        title: 'Compagnies - Partenaires'
      },
      {
        path: 'fonds',
        component: PartFondsComponent,
        title: 'Fonds & Soldes - Partenaires'
      },
      {
        path: 'facturation',
        component: PartFacturationComponent,
        title: 'Facturation - Partenaires'
      }
    ]
  },
  {
    path: 'referentiel',
    component: ReferentielComponent,
    children: [
      {
        path: '',
        redirectTo: 'gares',
        pathMatch: 'full'
      },
      {
        path: 'gares',
        component: RefGaresComponent,
        title: 'Villes & Gares - Référentiel'
      },
      {
        path: 'trajets',
        component: RefTrajetsComponent,
        title: 'Trajets - Référentiel'
      },
      {
        path: 'tarifs',
        component: RefTarifsComponent,
        title: 'Grille Tarifaire - Référentiel'
      }
    ]
  },
  {
    path: 'administration',
    component: AdministrationComponent,
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        title: 'Utilisateurs - Administration'
      },
      {
        path: 'roles',
        component: AdminRolesComponent,
        title: 'Rôles - Administration'
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
        title: 'Paramètres - Administration'
      }
    ]
  }
];
