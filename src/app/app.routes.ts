import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'app',
    loadComponent: () => import('./features/shell/app-shell-page/app-shell-page').then((m) => m.AppShellPage),
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products-page/products-page').then((m) => m.ProductsPage),
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory-page/inventory-page').then((m) => m.InventoryPage),
      },
      {
        path: 'pos',
        loadComponent: () => import('./features/pos/pos-page/pos-page').then((m) => m.PosPage),
      },
      {
        path: 'cash',
        loadComponent: () => import('./features/cash/cash-page/cash-page').then((m) => m.CashPage),
      },
      {
        path: 'cash-admin',
        loadComponent: () => import('./features/cash-admin/cash-admin-page/cash-admin-page.component').then((m) => m.CashAdminPage),
        canActivate: [adminGuard],
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./features/prescriptions/prescriptions-page/prescriptions-page').then((m) => m.PrescriptionsPage),
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing/billing-page/billing-page').then((m) => m.BillingPage),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports-page/reports-page').then((m) => m.ReportsPage),
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-page/users-page').then((m) => m.UsersPage),
      },
      // Routes added in FRONT-003
      {
        path: 'sales',
        loadComponent: () => import('./features/sales/sales-page/sales-page').then((m) => m.SalesPage),
      },
      {
        path: 'consumption',
        loadComponent: () => import('./features/consumption/consumption-page/consumption-page').then((m) => m.ConsumptionPage),
      },
      {
        path: 'purchases',
        loadComponent: () => import('./features/purchases/purchases-page/purchases-page').then((m) => m.PurchasesPage),
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/suppliers/suppliers-page/suppliers-page').then((m) => m.SuppliersPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings-page/settings-page').then((m) => m.SettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
