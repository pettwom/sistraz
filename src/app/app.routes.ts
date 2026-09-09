import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';
import { Perfil } from './pages/perfil/perfil';
import { Origen } from './pages/origen/origen';
import { Transporte } from './pages/transporte/transporte';
import { Almacenado } from './pages/almacenado/almacenado';
import { Tanque } from './pages/tanque/tanque';
import { Envasado } from './pages/envasado/envasado';
import { Despacho } from './pages/despacho/despacho';
import { Configuracion } from './pages/configuracion/configuracion';

export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '', component: MainLayout, canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'produccion', component: Origen },
            { path: 'transporte', component: Transporte},
            { path: 'almacenamiento', component: Almacenado },
            { path: 'tanque', component: Tanque },
            { path: 'envasado', component: Envasado },
            { path: 'despacho', component: Despacho },
            { path: 'configuracion', component: Configuracion },
            { path: 'perfil', component: Perfil },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
