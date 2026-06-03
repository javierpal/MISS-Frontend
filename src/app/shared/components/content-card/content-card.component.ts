import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-content-card',
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="content-card">
      @if (title()) {
        <mat-card-header class="content-card__header">
          <mat-card-title class="content-card__title">{{ title() }}</mat-card-title>
          @if (subtitle()) {
            <mat-card-subtitle class="content-card__subtitle">{{ subtitle() }}</mat-card-subtitle>
          }
          <div class="content-card__header-actions">
            <ng-content select="[header-actions]" />
          </div>
        </mat-card-header>
      }
      <mat-card-content class="content-card__body">
        <ng-content />
      </mat-card-content>
      @if (footer()) {
        <mat-card-footer class="content-card__footer">
          <ng-content select="[footer]" />
        </mat-card-footer>
      }
    </mat-card>
  `,
  styles: [`
    .content-card {
      margin-bottom: 1rem;
    }

    .content-card__header {
      padding: 1rem 1.25rem 0.5rem;
    }

    .content-card__title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--miss-text);
    }

    .content-card__subtitle {
      font-size: 0.8rem;
      color: var(--miss-text-muted);
    }

    .content-card__header-actions {
      margin-left: auto;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .content-card__body {
      padding: 1rem 1.25rem;
    }

    .content-card__footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--miss-border);
      background: var(--miss-surface-alt);
    }
  `],
})
export class ContentCardComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly footer = input<boolean>(false);
}
