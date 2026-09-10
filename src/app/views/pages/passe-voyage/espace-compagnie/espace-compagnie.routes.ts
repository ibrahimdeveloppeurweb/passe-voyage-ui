import { Routes } from '@angular/router';

export const espaceCompagnieRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/compagnie-dashboard/compagnie-dashboard.component').then(c => c.CompagnieDashboardComponent)
  },
  {
    path: 'activites-gares',
    loadComponent: () => import('./dashboard/activites-gares/activites-gares.component').then(c => c.ActivitesGaresComponent)
  },
  {
    path: 'billets-scannes',
    loadComponent: () => import('./dashboard/billets-scannes/billets-scannes.component').then(c => c.BilletsScannesComponent)
  },
  {
    path: 'finances',
    loadComponent: () => import('./dashboard/finances/finances.component').then(c => c.FinancesComponent)
  }
];
// Force Reload 2
