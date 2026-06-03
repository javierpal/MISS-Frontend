import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-header">
      <div class="page-header__left">
        @if (icon()) {
          <mat-icon class="page-header__icon">{{ icon() }}</mat-icon>
        }
        <div class="page-header__text">
          <h1 class="page-header__title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="page-header__subtitle">{{ subtitle() }}</p>
          }
        </div>
      </div>
      <div class="page-header__actions">
        <ng-content select="[action]" />
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem 0 1rem;
      flex-wrap: wrap;
    }

    .page-header__left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 0;
    }

    .page-header__icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--miss-primary);
      flex-shrink: 0;
    }

    .page-header__text {
      min-width: 0;
    }

    .page-header__title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--miss-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .page-header__subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--miss-text-muted);
    }

    .page-header__actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        gap: 0.75rem;
      }

      .page-header__left {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
}
