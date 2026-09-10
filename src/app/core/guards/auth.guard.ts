import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.isLoggedIn()) {
    const role = (auth.getRole() || '').toLowerCase();
    const perms = auth.getPermissions() || [];
    
    const isCompagnie = role.includes('compagnie') || role.includes('partenaire') || perms.includes('MENU_COMPAGNIE_DASHBOARD');
    const hasGrandDashboard = perms.includes('FULL_ACCESS') || perms.includes('MENU_DASHBOARD');

    // Protect passe-voyage admin routes from company users
    if (state.url.startsWith('/passe-voyage') && isCompagnie && !hasGrandDashboard) {
      router.navigate(['/espace-compagnie/dashboard']);
      return false;
    }

    return true;
  }

  // If the user is not logged in, redirect to the login page with the return URL
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url.split('?')[0] } });
  
  return false;
};
