import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  description?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.sidebar--collapsed]': 'isCollapsed',
    '[class.sidebar--mobile-open]': 'isMobileOpen',
  },
  template: `
    <nav class="sidebar" aria-label="Navegación principal">
      <div class="sidebar__brand">
        @if (!collapsed()) {
          <span class="sidebar__brand-text">MISS</span>
        } @else {
          <span class="sidebar__brand-text sidebar__brand-text--icon">M</span>
        }
      </div>

      <div class="sidebar__nav">
        @for (item of navItems(); track item.path) {
          <a
            mat-button
            class="sidebar__link"
            [routerLink]="item.path"
            routerLinkActive="sidebar__link--active"
            [routerLinkActiveOptions]="{ exact: item.path === '/app/dashboard' }"
            [attr.aria-label]="item.label"
          >
            <mat-icon class="sidebar__icon">{{ item.icon }}</mat-icon>
            <span class="sidebar__label">{{ item.label }}</span>
          </a>
        }
      </div>

      <div class="sidebar__footer">
        <button
          mat-button
          class="sidebar__collapse-btn"
          (click)="collapseChange.emit(!collapsed())"
          [attr.aria-label]="collapsed() ? 'Expandir sidebar' : 'Colapsar sidebar'"
        >
          <mat-icon>{{ collapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          <span class="sidebar__label">{{ collapsed() ? 'Expandir' : 'Colapsar' }}</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      width: 260px;
      min-width: 260px;
      height: 100%;
      background: var(--miss-surface);
      border-right: 1px solid var(--miss-border);
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease, min-width 0.25s ease;
      overflow: hidden;
      z-index: 20;
    }

    :host(.sidebar--collapsed) {
      width: 72px;
      min-width: 72px;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0.75rem 0;
    }

    .sidebar__brand {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid var(--miss-border);
    }

    .sidebar__brand-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--miss-primary);
      white-space: nowrap;
      overflow: hidden;
      transition: opacity 0.2s ease;
    }

    .sidebar__brand-text--icon {
      font-size: 1.5rem;
      text-align: center;
      width: 100%;
    }

    .sidebar__nav {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0;
    }

    .sidebar__link {
      display: flex;
      align-items: center;
      width: calc(100% - 1rem);
      padding: 0.6rem 1rem;
      margin: 0.15rem 0.5rem;
      border-radius: var(--miss-radius-md);
      justify-content: flex-start;
      gap: 0.75rem;
      color: var(--miss-text);
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .sidebar__link:hover {
      background: var(--miss-surface-alt);
      color: var(--miss-primary);
    }

    .sidebar__link--active {
      background: rgba(30, 136, 229, 0.1) !important;
      color: var(--miss-primary) !important;
      font-weight: 600;
    }

    .sidebar__icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      min-width: 20px;
    }

    .sidebar__label {
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity 0.2s ease;
    }

    :host(.sidebar--collapsed) .sidebar__label,
    :host(.sidebar--collapsed) .sidebar__brand-text:not(.sidebar__brand-text--icon) {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .sidebar__footer {
      border-top: 1px solid var(--miss-border);
      padding: 0.5rem 0;
    }

    .sidebar__collapse-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      width: calc(100% - 1rem);
      padding: 0.6rem 1rem;
      margin: 0 0.5rem;
      border-radius: var(--miss-radius-md);
      gap: 0.75rem;
      color: var(--miss-text-muted);
    }

    .sidebar__collapse-btn:hover {
      background: var(--miss-surface-alt);
      color: var(--miss-text);
    }

    :host(.sidebar--mobile-open) {
      position: fixed;
      top: 56px;
      left: 0;
      height: calc(100dvh - 56px);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 1023px) {
      :host:not(.sidebar--mobile-open) {
        transform: translateX(-100%);
        position: fixed;
        top: 56px;
        height: calc(100dvh - 56px);
      }

      :host(.sidebar--mobile-open) {
        transform: translateX(0);
      }
    }
  `],
})
export class SidebarComponent {
  readonly navItems = input.required<NavItem[]>();
  readonly collapsed = input<boolean>(false);
  readonly mobileOpen = input<boolean>(false);

  readonly collapseChange = output<boolean>();

  get isCollapsed(): boolean {
    return this.collapsed();
  }

  get isMobileOpen(): boolean {
    return this.mobileOpen();
  }
}
