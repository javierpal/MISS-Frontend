import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent, NavItem } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-shell-page',
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="shell-layout"
      [class.shell-layout--sidebar-collapsed]="sidebarCollapsed"
      [class.shell-layout--mobile-overlay]="mobileMenuOpen"
    >
      <app-topbar
        [title]="currentRouteTitle"
        [mobileMenuOpen]="mobileMenuOpen"
        (menuToggle)="toggleMobileMenu($event)"
      />

      <div class="shell-body">
        <app-sidebar
          [navItems]="navItems"
          [collapsed]="sidebarCollapsed"
          [mobileOpen]="mobileMenuOpen"
          (collapseChange)="toggleSidebar()"
        />

        <main class="shell-content">
          <div class="shell-content__inner">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100dvh;
      overflow: hidden;
    }

    .shell-layout {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    .shell-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .shell-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      background: var(--miss-bg);
      padding: 1.5rem;
    }

    .shell-content__inner {
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    @media (max-width: 1023px) {
      .shell-content {
        padding: 1rem;
      }

      .shell-layout--mobile-overlay::after {
        content: '';
        position: fixed;
        top: 56px;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 15;
      }
    }
  `],
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
