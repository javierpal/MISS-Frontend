import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';

import { NavigationItem } from '../../core/models/navigation-item.model';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-shell-page',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatSlideToggleModule, MatToolbarModule],
  template: `
    <main class="page-shell shell-layout">
      <mat-toolbar class="toolbar px-3 px-md-4">
        <div class="brand-block">
          <strong>MISS</strong>
          <span>Internal panel</span>
        </div>
        <span class="toolbar-spacer"></span>
        <mat-slide-toggle
          [checked]="themeService.isDark"
          (change)="themeService.toggle()"
        >
          Dark mode
        </mat-slide-toggle>
      </mat-toolbar>

      <div class="container-fluid py-4">
        <div class="row g-4">
          <div class="col-12 col-xl-3">
            <aside class="content-card nav-card p-3 p-md-4">
              <div class="nav-title mb-3">Módulos base</div>
              <nav class="nav-list d-grid gap-2">
                @for (item of navigation; track item.path) {
                  <a mat-stroked-button class="nav-link" [routerLink]="item.path" routerLinkActive="active-link">{{ item.label }}</a>
                }
              </nav>
            </aside>
          </div>
          <div class="col-12 col-xl-9">
            <section class="router-slot">
              <router-outlet />
            </section>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .brand-block { display: flex; flex-direction: column; line-height: 1.05; }
    .brand-block span { font-size: .8rem; color: var(--miss-text-muted); }
    .nav-title { font-weight: 700; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellPage implements OnInit {
  protected themeService = inject(ThemeService);

  ngOnInit(): void {
    // Theme already initialized via APP_INITIALIZER in app.config
  }

  protected readonly navigation: NavigationItem[] = [
    { label: 'Dashboard', path: '/app/dashboard', description: 'Vista general operativa.' },
    { label: 'Products', path: '/app/products', description: 'Catálogo y gestión de productos.' },
    { label: 'Inventory', path: '/app/inventory', description: 'Stock y movimientos.' },
    { label: 'POS', path: '/app/pos', description: 'Punto de venta.' },
    { label: 'Cash', path: '/app/cash', description: 'Caja y arqueos.' },
    { label: 'Prescriptions', path: '/app/prescriptions', description: 'Recetas y validaciones.' },
    { label: 'Billing', path: '/app/billing', description: 'Facturación.' },
    { label: 'Reports', path: '/app/reports', description: 'Reportes operativos.' },
    { label: 'Users', path: '/app/users', description: 'Usuarios y permisos.' },
  ];
}
