import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

import { ThemeService } from '../../../core/theme/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar class="topbar">
      <button
        mat-icon-button
        class="topbar__hamburger"
        (click)="menuToggle.emit(!mobileMenuOpen())"
        [attr.aria-label]="mobileMenuOpen() ? 'Cerrar menú' : 'Abrir menú'"
      >
        <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
      </button>

      <span class="topbar__title">{{ title() || 'MISS' }}</span>

      <span class="topbar__spacer"></span>

      <button
        mat-icon-button
        [attr.aria-label]="themeService.isDark ? 'Modo claro' : 'Modo oscuro'"
        (click)="themeService.toggle()"
      >
        <mat-icon>{{ themeService.isDark ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <button mat-button class="topbar__user-trigger" [matMenuTriggerFor]="userMenu" aria-label="Menú de usuario">
        <mat-icon>account_circle</mat-icon>
        <span class="topbar__user-name">{{ userName() }}</span>
      </button>

      <mat-menu #userMenu="matMenu" xPosition="before">
        <button mat-menu-item disabled>
          <mat-icon>person</mat-icon>
          <span>{{ userName() }}</span>
        </button>
        <button mat-menu-item (click)="onLogout()">
          <mat-icon>logout</mat-icon>
          <span>Cerrar sesión</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    :host {
      display: block;
    }

    .topbar {
      display: flex;
      align-items: center;
      padding: 0 1rem;
      min-height: 56px;
      background: var(--miss-surface);
      border-bottom: 1px solid var(--miss-border);
      z-index: 20;
    }

    .topbar__hamburger {
      display: none;
      margin-right: 0.5rem;
    }

    .topbar__title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--miss-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .topbar__spacer {
      flex: 1 1 auto;
    }

    .topbar__user-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--miss-text);
      margin-left: 0.25rem;
    }

    .topbar__user-name {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 1023px) {
      .topbar__hamburger {
        display: inline-flex;
      }

      .topbar__user-name {
        max-width: 110px;
      }
    }
  `],
})
export class TopbarComponent {
  protected readonly themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly title = input<string>('');
  readonly mobileMenuOpen = input<boolean>(false);
  readonly menuToggle = output<boolean>();

  protected userName(): string {
    const user = this.authService.getUser();
    return user ? user.name : 'Usuario';
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
