import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { Perfil } from './pages/perfil/perfil';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '', component: MainLayout, canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'perfil', component: Perfil },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
