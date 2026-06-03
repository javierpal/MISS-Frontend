import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage)
  },
  {
    path: 'app',
    loadComponent: () => import('./features/shell/app-shell.page').then((m) => m.AppShellPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'products', loadComponent: () => import('./features/products/products.page').then((m) => m.ProductsPage) },
      { path: 'inventory', loadComponent: () => import('./features/inventory/inventory.page').then((m) => m.InventoryPage) },
      { path: 'pos', loadComponent: () => import('./features/pos/pos.page').then((m) => m.PosPage) },
      { path: 'cash', loadComponent: () => import('./features/cash/cash.page').then((m) => m.CashPage) },
      { path: 'prescriptions', loadComponent: () => import('./features/prescriptions/prescriptions.page').then((m) => m.PrescriptionsPage) },
      { path: 'billing', loadComponent: () => import('./features/billing/billing.page').then((m) => m.BillingPage) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.page').then((m) => m.ReportsPage) },
      { path: 'users', loadComponent: () => import('./features/users/users.page').then((m) => m.UsersPage) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
