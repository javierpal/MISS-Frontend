import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shell-page',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './app-shell-page.html',
  styleUrl: './app-shell-page.scss',
})
export class AppShellPage implements OnInit {
  private authService = inject(AuthService);

  protected mobileMenuOpen = false;
  protected sidebarCollapsed = false;
  protected navItems: NavItem[] = [];

  private allNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/dashboard', icon: 'dashboard', description: 'Vista general operativa.' },
    { label: 'POS', path: '/app/pos', icon: 'point_of_sale', description: 'Punto de venta.' },
    { label: 'Productos', path: '/app/products', icon: 'inventory_2', description: 'Catálogo y gestión de productos.' },
    { label: 'Inventario', path: '/app/inventory', icon: 'inventory', description: 'Stock y movimientos.' },
    { label: 'Recetas', path: '/app/prescriptions', icon: 'local_pharmacy', description: 'Recetas y validaciones.' },
    { label: 'Ventas', path: '/app/sales', icon: 'shopping_cart', description: 'Historial de ventas.' },
    { label: 'Caja', path: '/app/cash', icon: 'account_balance', description: 'Caja y arqueos.' },
    { label: 'Caja Admin', path: '/app/cash-admin', icon: 'admin_panel_settings', description: 'Administración de caja.' },
    { label: 'Facturación', path: '/app/billing', icon: 'receipt_long', description: 'Facturación CFDI.' },
    { label: 'Reportes', path: '/app/reports', icon: 'bar_chart', description: 'Reportes operativos.' },
    { label: 'Consumo interno', path: '/app/consumption', icon: 'local_dining', description: 'Consumo interno de inventario.' },
    { label: 'Compras', path: '/app/purchases', icon: 'shopping_bag', description: 'Órdenes de compra y recepción.' },
    { label: 'Proveedores', path: '/app/suppliers', icon: 'store', description: 'Catálogo de proveedores.' },
    { label: 'Usuarios y permisos', path: '/app/users', icon: 'people', description: 'Gestión de usuarios y roles.' },
    { label: 'Configuración', path: '/app/settings', icon: 'settings', description: 'Configuración del sistema.' },
  ];

  ngOnInit(): void {
    this.filterNavByRole();
  }

  private filterNavByRole(): void {
    const user = this.authService.getUser();
    const role = user?.role || '';

    // Filtrar items según rol
    this.navItems = this.allNavItems.filter((item) => {
      // Admin solo ve Caja Admin
      if (role === 'ADMIN' && item.path === '/app/cash') {
        return false;
      }
      // Cajero no ve Caja Admin
      if (role !== 'ADMIN' && item.path === '/app/cash-admin') {
        return false;
      }
      // Usuarios normales no ven Usuarios y permisos ni Configuración
      if (role !== 'ADMIN' && (item.path === '/app/users' || item.path === '/app/settings')) {
        return false;
      }
      return true;
    });
  }

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
