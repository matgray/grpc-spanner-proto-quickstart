import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
    },
    {
        path: '',
        loadComponent: () => import('./components/layout/layout').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'overview',
                loadComponent: () => import('./components/overview/overview').then(m => m.OverviewComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent)
            },
            {
                path: '',
                redirectTo: '/overview',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];