import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.isLoggedIn()) {
    // If the user is logged in, then return true
    return true;
  }

  // If the user is not logged in, redirect to the login page with the return URL
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url.split('?')[0] } });
  
  return false;
};
