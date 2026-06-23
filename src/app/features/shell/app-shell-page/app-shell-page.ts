import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell-page',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './app-shell-page.html',
  styleUrl: './app-shell-page.scss',
})
export class AppShellPage {
  protected mobileMenuOpen = false;
  protected sidebarCollapsed = false;

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/dashboard', icon: 'dashboard', description: 'Vista general operativa.' },
    { label: 'POS', path: '/app/pos', icon: 'point_of_sale', description: 'Punto de venta.' },
    { label: 'Productos', path: '/app/products', icon: 'inventory_2', description: 'Catálogo y gestión de productos.' },
    { label: 'Inventario', path: '/app/inventory', icon: 'inventory', description: 'Stock y movimientos.' },
    { label: 'Recetas', path: '/app/prescriptions', icon: 'local_pharmacy', description: 'Recetas y validaciones.' },
    { label: 'Ventas', path: '/app/sales', icon: 'shopping_cart', description: 'Historial de ventas.' },
    { label: 'Caja', path: '/app/cash', icon: 'account_balance', description: 'Caja y arqueos.' },
    { label: 'Facturación', path: '/app/billing', icon: 'receipt_long', description: 'Facturación CFDI.' },
    { label: 'Reportes', path: '/app/reports', icon: 'bar_chart', description: 'Reportes operativos.' },
    { label: 'Consumo interno', path: '/app/consumption', icon: 'local_dining', description: 'Consumo interno de inventario.' },
    { label: 'Compras', path: '/app/purchases', icon: 'shopping_bag', description: 'Órdenes de compra y recepción.' },
    { label: 'Proveedores', path: '/app/suppliers', icon: 'store', description: 'Catálogo de proveedores.' },
    { label: 'Usuarios y permisos', path: '/app/users', icon: 'people', description: 'Gestión de usuarios y roles.' },
    { label: 'Configuración', path: '/app/settings', icon: 'settings', description: 'Configuración del sistema.' },
  ];

  get currentRouteTitle(): string {
    const currentPath = window.location.pathname;
    const active = this.navItems.find((item) => currentPath.startsWith(item.path));
    return active?.label ?? 'MISS';
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1024) {
      this.mobileMenuOpen = false;
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth < 1024) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      return;
    }

    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(open: boolean): void {
    this.mobileMenuOpen = open;
  }
}
