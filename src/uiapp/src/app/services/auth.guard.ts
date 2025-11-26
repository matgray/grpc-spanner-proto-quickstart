import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const loginResponseStr = localStorage.getItem('login_response');

  if (loginResponseStr) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
