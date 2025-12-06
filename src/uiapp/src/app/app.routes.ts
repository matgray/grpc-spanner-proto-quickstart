import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';
import { Place } from './place/place';
import { OVERVIEW_PLACE } from './place/overview.place';

const appPlaces: Place[] = [
    OVERVIEW_PLACE,
    // Add other places here
];

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
            ...appPlaces.map(place => ({
                path: place.path,
                loadComponent: () => Promise.resolve(place.component).then(m => m),
            })),
            {
                path: '',
                redirectTo: appPlaces[0].path, // Redirect to the first place by default
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];